var config = require('config');
var Sequelize = require('sequelize');

var models = require('./models.js');
var crypto = require('../crypto.js');
var eth = require('../blockchain/eth.js');

//TODO: Using testnet for testing
var btc = require('../blockchain/btc.js');
var request = require('request');
var blocked_emails = require('../blocked_emails.js');

var bitgoapi = require('../blockchain/bitgo.js');


//One-time setup - clears database and creates the contracts on the blockchain
exports.setup = function() {
	return Promise.all([
		exports.models.createModels(true),
		eth.getGSCBank().create(),
		eth.getGoldBank().create()
	]).then(exports.createUser(config.testuser));
}

exports.sequelize = new Sequelize(config.get('db.name'), config.get('db.user'),config.get('db.password'),
	{
		host: config.get('db.host'),
		dialect: 'postgres',
		pool: {
			max: config.get('db.pool.max'), 
			min: config.get('db.pool.min'), 
			idle: config.get('db.pool.idle')
		},
		logging: false
	}
);

exports.connected = false;

//Utility functions, uncalled in main code
exports.refreshBTCAddress = function(user) {
	return new Promise((resolve, reject) => {
		btc.createAddress().then(btcadd => {
			user.update({
				btcAddress: btcadd.address,
				btcKey: btcadd.key
			}).then(() => resolve(), err => reject(err));
		}, err => reject(err));		
	})
}

// TODO: Remove this line after testing
exports.getETH = function() { return eth;};

exports.connect = function() {
	return new Promise(function(resolve, reject) {
		console.log("Connecting to database...");
		exports.sequelize
			.authenticate()
			.then(function(msg) {
				console.log("Connected to database.");
				exports.connected = true;
				resolve(msg);
			}, function(err) {
				console.log("Unable to connect to database.",err);
				exports.connected = false;
				reject(err);
				process.exit(1);
			});
	});
}

models.init(exports.sequelize);

exports.models = models;

exports.addTransaction = function(address, funcName, contractAddress, targetAddress, params) {
	if(typeof params != 'string')
		params = JSON.stringify(params);
	return exports.models.models.Transaction.create({
		address:address, funcName:funcName, contractAddress:contractAddress, targetAddress:targetAddress, params:params
	}).then((val) => {console.log("Transaction added to database - ",val.address); return val;}, (err) => {
		console.log("Transaction cannot be added to database. Error - ",err)
	});
}

eth.setTxLogger(exports.addTransaction);
btc.setTxLogger(exports.addTransaction);

exports.mined = function(txAddress, type) {
	return new Promise((resolve, reject) => {
		try {
			if(type == "BTC")
				btc.txMined(txAddress).then(mined=>resolve(mined),err=>reject(err));
			else
				resolve(eth.txMined(txAddress));
		} catch(exception) {
			console.log("Exception in db.mined - ",exception);
			reject();
		}
	});
}

exports.getTransactions = function(funcNames, targetAddress, contractAddress) {
	return new Promise(function(resolve, reject) {
		searchParams = {}
		if(contractAddress != null)
			searchParams.contractAddress = contractAddress;
		if(funcNames != null) 
			searchParams.funcName = funcNames;
		if(targetAddress != null)
			searchParams.targetAddress = targetAddress;

		console.log("getTransactions called. SearchParams - ",searchParams);

		exports.models.models.Transaction.findAll({
			where: searchParams
		}).then(txs => {
			console.log("getTransactions found ", txs.length, " transactions for searchParams - ",searchParams,". txs - ",txs);

			newtxs = [];
			destroyP = [];
			// txs.forEach((tx) => txValidators.push(validateTransaction(tx)));
			txs.forEach((tx) => destroyP.push(
				new Promise((resolve, reject) => {
					console.log("Pushing tx ",tx.address);
					exports.mined(tx.address, tx.contractAddress).then(tMined => {
						console.log("tmined is ",tMined," for tx ", tx.address);
						if(tMined == true) {
							console.log("Transaction ",tx.address," mined. Removing from database.");
							tx.destroy().then(()=>resolve(tx),err=>reject(err));
						}
						else if(tMined == null) {
							if(tx.contractAddress == "BTC") {
								if((((new Date()) - tx.updatedAt)/(1000*24*60*60)) > 1) {
									console.log("BTC Transaction ", tx.address, " cannot be found and is too old. Removing...");
									tx.destroy().then(() => resolve(tx), err => reject(err));
								} else {
									console.log("BTC Transaction ", tx.address, " cannot be found but is less than a day old. Not removing yet...");
									newtxs.push(tx);
								}
							} else {
								console.log("non-BTC Transaction ",tx.address," cannot be found in the blockchain. Removing from database.");
								tx.destroy().then(()=>resolve(tx),err=>reject(err));
							}
						}
						else if(tMined == false) {
							console.log("Transaction ",tx.address," hasn't been mined yet.");
							newtxs.push(tx);
						}
						resolve();
					}, err => {
						console.log("Error checking mined status of transaction ", tx.address," - ",err);
						reject(err);
					});
				})));

			Promise.all(destroyP).then(() => {
				if(destroyP.length > 0)
					console.log(destroyP.length," - Transactions deleted.");
				resolve(newtxs);
			}, (err)=>{console.log("Error in deleting transactions from database - ",err); reject(err)});
		});
	});
}

exports.getETHBalance = function(address) {
	return new Promise((resolve, reject) => {
		eth.getBalance(address).then(balance => {
			exports.getTransactions(["withdrawETH","transferETH"], address).then(txs => {
				for(txid in txs)
					balance -= JSON.parse(txs[txid].params).quantity;
				resolve(balance);
			}, err => reject(err));
		}, err => reject(err));
	});
}

exports.depositETH = function(user, amount) {
	return new Promise((resolve, reject) => {
		var sendAddress = config.get('blockchain.eth.sendAddress');
		exports.getETHBalance(sendAddress).then(balance => {
			if(balance < amount) reject("serverEmpty");
			else if(!eth.web3.personal.unlockAccount(sendAddress, config.get('blockchain.eth.sendPassword'))) {
				console.log("Send Address unlock failed.");
				reject('serverEmpty');
			}
			else {
				eth.web3.eth.sendTransaction({
					from: config.get('blockchain.eth.sendAddress'),
					to: user.ethAddress,
					value: amount
				}, (err, txAddress) => {
					if(!err) {
						exports.addTransaction(txAddress, "depositETH", "", user.ethAddress, 
							{from: sendAddress, to:user.ethAddress, quantity: amount});
						console.log("Registered deposit of ",amount," wei for account ",user.ethAddress);
						resolve(txAddress);
					}
				});
			}
		}, err => reject('serverEmpty'));
	});
}

exports.transferETH = function(fromUser, toAddress, amount) {
	return new Promise((resolve, reject) => {
		exports.getETHBalance(fromUser.ethAddress).then(balance => {
			if(balance < amount) reject("insufficientFunds");
			else if(!eth.web3.personal.unlockAccount(fromUser.ethAddress, fromUser.salt))
				reject("userLocked");
			else {
				eth.web3.eth.sendTransaction({
					from: fromUser.ethAddress,
					to: toAddress,
					value: amount
				}, (err, txAddress) => {
					if(!err) {
						exports.addTransaction(txAddress, "transferETH", "", fromUser.ethAddress,
							{from:fromUser.ethAddress, to:toAddress, quantity: amount});
						console.log("Registered transfer from ",fromUser.ethAddress," to ",toAddress,", of amount ",amount);
						resolve(txAddress);
					} else {
						console.log("Error in transfer funds - ",err);
						reject(err);
					}
				});
			}
		}, err => reject("insufficientFunds"));
	});
}

exports.withdrawETH = function(user, amount) { //Amount in Wei
	return new Promise((resolve, reject) => {
		exports.getETHBalance(user.ethAddress).then(balance => {
			if(balance < amount) reject("insufficientFunds");
			else if(!eth.web3.personal.unlockAccount(user.ethAddress, user.salt))
				reject("userLocked");
			else {
				eth.web3.eth.sendTransaction({
					from:user.ethAddress, 
					to:config.get('blockchain.eth.receiveAddress'), 
					value:amount
				},(err, txAddress) => {
					if(!err) {
						exports.addTransaction(txAddress, "withdrawETH", "", user.ethAddress, 
							{from:user.ethAddress, to:config.get('blockchain.eth.receiveAddress'), quantity: amount});
						console.log("Registered withdrawal of ",amount," wei for account ",user.ethAddress);
						resolve(txAddress);
					} else
						reject("insufficientFunds");
				});
			}			
		}, err => reject("insufficientFunds"));
	});
}

exports.withdrawBTC = function(user, quantity) {
	return exports.transferBTC(user, config.blockchain.btc.receiveAddress, quantity, "withdraw");
}

exports.depositBTC = function(address, quantity) {
	// return exports.transferBTC({
	// 	btcAddress: config.blockchain.btc.sendAddress,
	// 	btcKey: config.blockchain.btc.sendKey
	// }, address, quantity, "deposit");

	return bitgoapi.getAdminBalance().then((adminBalance => {
		if(adminBalance < quantity) {
			console.log("Admin Account is out of funds. Rejecting.");
			return Promise.reject("insufficientFunds");
		} else return bitgoapi.sendAdminBalance(quantity, address);
	}));
}

exports.transferBTC = function(user, toAddress, quantity, mode, minerFee) {
	try {
		if(mode == null)
			mode = "transfer";
		console.log("minerFee in transferBTC is ",minerFee);
		return exports.getBTCBalance(user.btcAddress)
			.then(balance => {
				if(balance < quantity)
					return Promise.reject("insufficientFunds");
				return exports.getTransactions(["withdrawBTC", "transferBTC"], user.btcAddress);
			}).then(txs => {
				pendingTxs = [];
				txs.forEach(tx => pendingTxs.push(tx.address));
				if(pendingTxs.length == 0) pendingTxs = undefined;
				console.log("Calling BTCTransfer with toAddress ",toAddress);
				return btc.transfer(user.btcKey, toAddress, quantity, pendingTxs, minerFee);
			}).then(txAddress => {
				return exports.addTransaction(txAddress, mode+"BTC","BTC",user.btcAddress, JSON.stringify({
					from:user.btcAddress,
					to:toAddress,
					quantity:quantity
				})).then(() => {return txAddress});
			});
			// , err => {
			// 	console.log("BTC Transfer failed with error - ",err);
			// });
	} catch(exception) {
		console.log("Exception in transferBTC - ",exception);
	}
}

exports.isBTCPending = function(address) {
	return exports.getTransactions(["withdrawBTC","transferBTC"], address).then(txs => {
		if(txs.length > 0)
			return true;
		else
			return false;
	});
}

exports.getBTCBalance = function(address) {
	return new Promise((resolve, reject) => {
		btc.getBalance(address).then(balance => {
			exports.getTransactions(["withdrawBTC","transferBTC"], address).then(txs => {
				for(txid in txs)
					balance -= JSON.parse(txs[txid].params).quantity;
				resolve(balance);
			}, err => reject(err));
		}, err => reject(err));
	});
}

exports.getGSCBalance = function(address) {
	return new Promise((resolve, reject) => {
		instruments = config.contracts.instruments;
		// First get the actual balance
		balances = {}
		balancePromises = []
		instruments.forEach(instrument => balancePromises.push(eth.getGSCBank().getBalance(address, instrument[0])));

		Promise.all(balancePromises).then(values => {
			for(vid in values)
				balances[instruments[vid][0]] = values[vid];
			exports.getTransactions("mintNewGSC", address);
			exports.getTransactions(["burn","transfer"], address, eth.getGSCBank().instance.address).then(txs => {
				for(txid in txs) {
					params = JSON.parse(txs[txid].params);
					balances[params.instrument] -= params.quantity;
				}
				resolve(balances);
			}, err => reject(err));
		}, err => reject(err));


	}, err => reject(err));
}

exports.mintNewGSC = function(address, instrument, quantity) {
	return eth.getGSCBank().mintNewGSC(address, instrument, quantity);
}


exports.burnGSC = function(address, instrument, quantity) {
	return exports.getGSCBalance(address, quantity).then(balances => {
		if(balances[instrument] < quantity)
			return Promise.reject("insufficientFunds");
		else
			return eth.getGSCBank().burn(address, instrument, quantity);
	});
}


exports.transferGSC = function(sender, recipient, instrument, quantity) {
	return exports.getGSCBalance(sender, quantity).then(balances => {
		if(balances[instrument] < quantity)
			return Promise.reject("insufficientFunds");
		else
			return eth.getGSCBank().transfer(sender, recipient, instrument, quantity);
	});
}


exports.mintNewDNC = function(address, quantity) {
	return eth.getGoldBank().mintNewDNC(address, quantity);
}

exports.burnDNC = function(address, quantity) {
	return new Promise((resolve, reject) => {
		exports.getDNCBalance(address,quantity).then(balance => {
			if(balance < quantity)
				reject("insufficientFunds");
			else
				eth.getGoldBank().burn(address, quantity).then((txAddress) => resolve(txAddress), err => reject(err));
		}, err => reject(err));
	});
}

exports.transferDNC = function(fromAddress, toAddress, quantity) {
	return new Promise((resolve, reject) => {
		exports.getDNCBalance(fromAddress, quantity).then(balance => {
			if(balance < quantity) {
				console.log("Insufficient Funds for transfer. Requested ",quantity,", available ",balance);
				reject("insufficientFunds");
			}
			else
				eth.getGoldBank().transfer(fromAddress, toAddress, quantity)
					.then(txAddress => resolve(txAddress), err => reject(err));
		}, err => reject(err));
	});
}

exports.getDNCBalance = function(address) {
	// First get the actual balance
	return new Promise((resolve, reject) => {
		eth.getGoldBank().getBalance(address).then((balance) => {
			console.log("Got balance of ",balance," from contract.");
			// This is to clear any mint transactions - keep the db working - will amortize out
			exports.getTransactions(["mintNewDNC"],address);
			exports.getTransactions(["burn","transfer"],address,eth.getGoldBank().instance.address).then(txs => {
				console.log("Calculating balance - got ",txs.length, " pending transactions to blockchain.");
				for(txid in txs) {
					if(!txs[txid].funcName.includes("mint")) {
						balance -= JSON.parse(txs[txid].params).quantity;
						console.log("Subtracted ",JSON.parse(txs[txid].params).quantity," from the DNC balance due to pending txs.");
					}
				}
				if(balance < 0) balance = 0;
				resolve(balance);
			}, err => {
				console.log("retrieving balance transactions returned error - ",err);
				reject(err);
			});
		}, err => {
			console.log("Retrieving balance returned error - ",err); 
			reject(err);
		});		
	});
}

exports.issueToken = function(email, password, agent, adminBypass) {
	console.log("issueToken - agent: ",agent);
	return new Promise(function(resolve, reject) {
		exports.models.models.User.findAll({
			where: {email: email}
		}).then(function(users) {
			if(users.length <= 0) {
				console.log("issueToken - email not found")
				reject("invalidEmail");
				return;
			}
			if(adminBypass == true) {
				console.log("Issuing authtoken through admin for user "+email+" at "+Math.trunc(new Date() / 1000));
				authtoken = {
					email: email,
					salt: users[0].salt,
					created: Math.trunc(new Date() / 1000),
					agent: crypto.getSHA1ofJSON(agent),
					access: "all"
				};
				resolve(crypto.jsonEncrypt(authtoken));				
			}
			else if(crypto.sha512(password,users[0].salt)['passwordHash'] == users[0].password) {
				console.log("Issuing authtoken for user "+email+" at "+Math.trunc(new Date() / 1000));
				authtoken = {
					email: email,
					salt: users[0].salt,
					created: Math.trunc(new Date() / 1000),
					agent: crypto.getSHA1ofJSON(agent),
					access: "all"
				};
				resolve(crypto.jsonEncrypt(authtoken));
			} else {
				reject("incorrectPassword");
			}
		}, function(err) {
			reject("invalidEmail");
		});
	});
}

exports.authAdmin = function(authtoken, agent) {
	return new Promise((resolve, reject) => {
		crypto.jsonDecrypt(authtoken).then(atoken => {
			exports.models.models.User.findAll({
				where: {email: atoken.email, salt: atoken.salt}
			}).then(function(users) {
				if(users.length <= 0 || atoken.email != config.auth.adminEmail)
					reject("invalidAdmin");
				else
					resolve(users[0]);
			}, function(err) {
				reject("queryFailure");
			});			
		}, err => {
			reject("invalidToken");
		});
	});
}

exports.authUser = function(authtoken, agent) {
	return new Promise(function(resolve, reject) {
		// console.log("received authtoken - ",authtoken);
		crypto.jsonDecrypt(authtoken).then(atoken => {
			if(crypto.getSHA1ofJSON(agent) != atoken.agent) {
				reject("invalidAgent");
				return;
			}
			// console.log("Authentication - Searching with email ", atoken.email, " and salt ", atoken.salt);

			// if(blocked_emails.emails.includes(atoken.email)) {
			// 	console.log("Exiting because user ",atoken.email," is blocked due to migration.");
			// 	reject("invalidUser");
			// }
			// else {
			exports.models.models.User.findAll({
				where: {email: atoken.email, salt: atoken.salt}
			}).then(function(users) {
				if(users.length <= 0)
					reject("invalidUser");
				else
					resolve(users[0]);
			}, function(err) {
				reject("queryFailure");
			});			
			// }
		}, err => {
			reject("invalidToken");
		});
	});
}

exports.registerAccounts = function(user) {
	return new Promise(function (resolve, reject) {
		Promise.all([
			eth.newAccount(user.salt),
			btc.createAddress()
		]).then(values => {
			console.log("createAccounts returned - ",values);
			user.update({
				ethAddress: values[0],
				btcAddress: values[1]['address'],
				btcKey: values[1]['key']
			}).then(() => resolve(), err => reject(err));
		}, err => reject(err));
	});
}

exports.createUser = function(userInfo) {

	//Whenever you create a user, cleanup the transactions db of createUsers;
	exports.getTransactions("createUser").then(vals=>console.log("Cleaned create Txs."), err=>console.log("Error in deleting create transactions - ",err));

	var salt = crypto.genRandomString(config.get("crypto.saltSize"));

	return new Promise(function(resolve, reject) {

		userObj = {email: userInfo.email, 
			firstName: userInfo.firstName, 
			lastName: userInfo.lastName,
			country: userInfo.country,
			phNumber: userInfo.phoneNumber,
			password: crypto.sha512(userInfo.password, salt)['passwordHash'],
			salt: salt, 
			kyc: false, 
			emailVerified: false,
			btcAddress: "", btcKey: "", ethAddress: "",
			privateEthAddress: "", privateBtcAddress: "", ethAccountCreated: false};

		if(userInfo.dob != undefined && userInfo.dob != '') userObj.dob = userInfo.dob;
		if(userInfo.address1 != undefined) userObj.address1 = userInfo.address1;
		if(userInfo.address2 != undefined) userObj.address2 = userInfo.address2;
		if(userInfo.city != undefined) userObj.city = userInfo.city;
		if(userInfo.state != undefined) userObj.state = userInfo.state;
		if(userInfo.postalCode != undefined) userObj.postalCode = userInfo.postalCode;

		console.log("userObj - ",userObj);
		
		exports.models.models.User.create(userObj).then(function(user) {
			console.log("User created - ",user);
			exports.registerAccounts(user).then(() => resolve(user), err => reject(err));
		}, err => reject(err));
	});
}

exports.loadUser = function(userInfo) {

	//Whenever you create a user, cleanup the transactions db of createUsers;
	// exports.getTransactions("loadUser").then(vals=>console.log("Cleaned create Txs."), err=>console.log("Error in deleting create transactions - ",err));

	var salt = "";

	//Remove importing of ETH addresses
	delete userInfo['ethPassword'];
	delete userInfo['ethAddress'];

	if('ethPassword' in userInfo)
		salt = userInfo['ethPassword'];
	else
		salt = crypto.genRandomString(config.get("crypto.saltSize"));

	return new Promise(function(resolve, reject) {
		exports.models.models.User.create({
			email: userInfo.email, dob: userInfo.dob,
			firstName: userInfo.firstName, lastName: userInfo.lastName,
			address1: userInfo.address, address2: userInfo.address2,
			city: userInfo.city, state: userInfo.state, country: userInfo.country,
			postalCode: userInfo.postalCode, phNumber: userInfo.phoneNumber,
			password: crypto.sha512(userInfo.password, salt)['passwordHash'],
			salt: salt, kyc: false, emailVerified: false,
			btcAddress: 'btcAddress' in userInfo ? userInfo.btcAddress : "", 
			btcKey: 'btcAddress' in userInfo ? userInfo.btcKey : "", 
			ethAddress: 'ethAddress' in userInfo ? userInfo.ethAddress : "",
			privateEthAddress: "", privateBtcAddress: "", ethAccountCreated: false
		}).then(function(user) {
			console.log("User loaded pending accounts - ",user);
			accountPromises = [];
			if(!('ethAddress' in userInfo))
				accountPromises.push(eth.justAccount(salt));
			else
				accountPromises.push(Promise.resolve(userInfo.ethAddress));
			if(!('btcAddress' in userInfo))
				accountPromises.push(btc.createAddress());
			else
				accountPromises.push(Promise.resolve({address:userInfo.btcAddress,key:userInfo.btcKey}));
			// if('ethAddress' in userInfo) {
			// 	accountPromises.push(eth.getGoldBank().createUser(userInfo.ethAddress, userInfo.ethAddress, userInfo.ethAddress));
			// 	accountPromises.push(eth.getGSCBank().createUser(userInfo.ethAddress, userInfo.ethAddress, userInfo.ethAddress));			
			// }

			Promise.all(accountPromises).then(values => {
				console.log("Create Account Promises returned - ",values);
				return user.update({
					ethAddress: values[0],
					btcAddress: values[1]['address'],
					btcKey: values[1]['key']
				}).then(() => resolve(user), err => reject(err));
			});
			// exports.registerAccounts(user).then(() => resolve(user), err => reject(err));
		}, err => reject(err));
	});
}