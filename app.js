"use strict";

//Express middleware for istanbul coverage
var im = require('istanbul-middleware'),
    isCoverageEnabled = (process.env.COVERAGE == "true"); // or a mechanism of your choice

//before your code is require()-ed, hook the loader for coverage
if (isCoverageEnabled) {
    console.log('Hook loader for coverage - ensure this is not production!');
    im.hookLoader(__dirname);
        // cover all files except under node_modules
        // see API for other options
}

var crypto = require('./crypto.js');

var express = require('express');
var config 	= require('config');
var https 	= require('https');
var fs 		= require('fs');
var bodyParser = require('body-parser');
var cors 	= require('cors');
var db 		= require('./db/core.js');
//TODO: Move back to bitcoin, testnet now for, you know, testing
var btc 	= require('./blockchain/btc.js');
var mt4		= require('./mt4/mt4.js');
var postmark = require('postmark');
var postmarkClient = new postmark.Client(config.postmark.APIKey);
var bitgoapi = require('./blockchain/bitgo.js');
var blocked_emails = require('./blocked_emails.js');

var app 	= express();

//TODO: expose modules for testing, debate on whether to remove
exports.db = db;
exports.btc = btc;
exports.mt4 = mt4;

app.use(cors());
app.options('*', cors());
/*app.use(cors({
	origin: "http://universalblockchains.com",
	optionsSuccessStatus: 200
}));
*/
app.use(im.createClientHandler(__dirname));

//TODO: Fix Promise nesting
// TODO: Test Buy and Sell GSC
//TODO: Debugging function to print request, remove
app.use((req, res, next) => {
	console.log("\n######REQUEST: ",req.url);
	next();
});	

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res) {
   res.send('DinarDirham Main API.');
})

function authenticate(req, res, next) {
	try {
		console.log("Authenticating...");

		db.authUser(req.body.authToken, req.headers['user-agent']).then((user) => {
			req.user = user;
			next();
		}, err => {
			console.log("Authentication failed for ",req.url," with error ",err);
			res.send(JSON.stringify({success:false, message: "invalidAuthToken", body:null}));
		});
	} catch(exception) {
		console.log("Exception in authenticate - ",err);
		res.send(JSON.stringify({success:false, message: "invalidResponse", body:null}));
	}
}

function authenticateAdmin(req, res, next) {
	try {
		console.log("Authenticating...");

		db.authAdmin(req.body.adminAuthToken, req.headers['user-agent']).then((user) => {
			req.user = user;
			authenticate(req, res, next);
		}, err => {
			console.log("Admin Authentication failed for ",req.url," with error ",err);
			res.send(JSON.stringify({success:false, message: "invalidAdmin", body:null}));
		});
	} catch(exception) {
		console.log("Exception in authenticate - ",err);
		res.send(JSON.stringify({success:false, message: "invalidResponse", body:null}));
	}
}

function authenticateOnlyAdmin(req, res, next) {
	try {
		console.log("Authenticating only admin...");

		db.authAdmin(req.body.adminAuthToken, req.headers['user-agent']).then((user) => {
			req.user = user;
			next()		
		}, err => {
			console.log("Admin Authentication failed for ",req.url," with error ",err);
			res.send(JSON.stringify({success:false, message: "invalidAdmin", body:null}));
		});
	} catch(exception) {
		console.log("Exception in authenticate - ",err);
		res.send(JSON.stringify({success:false, message: "invalidResponse", body:null}));
	}
}

app.all('/api/v1/totalSupply', function(req, res) { 
	try {	
		res.send(String(Number(db.getETH().getGoldBank().instance.totalSupply())/10));
	} catch(exception) {
		console.log("Error in totalSupply - ",exception);
		res.send("error - please contact support");
	}
});

app.post('/api/v1/userops/create_new_user', function(req,res) {
	try {
		console.log("Body: ",req.body);
		if(req.body.dob != undefined && req.body.dob != '') {
			var dob_str = req.body.dob.split("/");
			var dob = new Date(dob_str[2],dob_str[1]-1,dob_str[0]);

			req.body.dob = dob;
		}

		db.createUser(req.body).then(function(msg) {
			console.log("Created new user ",req.body.email);
			res.send(JSON.stringify({success: true, message: "userRegistered"}));
		}, function(err) {
			console.log("Error in creating user: ", err);
			res.send(JSON.stringify({success: false, message: "userExists"}));
		});
	} catch(exception) {
		console.log("CREATE_NEW_USER Exception - ",exception);
		res.send(JSON.stringify({success:false, message: "invalidRequest"}));
	}
});

app.post('/api/v1/userops/login', function(req,res) {
	try {
		console.log("Received login request: ",req.body.email);

		db.issueToken(req.body.email, req.body.password, req.headers['user-agent']).then(function(token) {
			res.send(JSON.stringify({
				success: true,
				body: token,
				msg: null
			}));		
		}, function(err) {
			res.send(JSON.stringify({
				success:false,
				body: null,
				msg: err
			}));
		});
	} catch(err) {
		console.log("Error in login - ",err);
		res.send(JSON.stringify({
			success:false,
			body: null,
			msg: err
		}));
	}
});

app.post('/api/v1/admin/admin_login', authenticateOnlyAdmin, function(req,res) {
	try {
		console.log("Received Admin login request: ",req.body.email);

		db.issueToken(req.body.email, req.body.password, req.headers['user-agent'], true).then(function(token) {
			res.send(JSON.stringify({
				success: true,
				body: token,
				msg: null
			}));		
		}, function(err) {
			res.send(JSON.stringify({
				success:false,
				body: null,
				msg: err
			}));
		});
	} catch(err) {
		console.log("Error in login - ",err);
		res.send(JSON.stringify({
			success:false,
			body: null,
			msg: err
		}));
	}
});

app.post('/api/v1/userops/get_user_data', authenticate, function(req,res) {
	var response = {};
	response.body = null;

	response.success = true;

	response.body = {
        email : req.user.email,
	    firstName : req.user.firstName,
    	lastName : req.user.lastName,
    	BTCaddress : req.user.btcAddress,
    	ETHaddress : req.user.ethAddress,
    	KYCAML: req.user.kyc,
    	privateAccounts : {
      		BTCaddress : req.user.privateBtcAddress,
      		ETHaddress : req.user.privateEthAddress
    	},
    	balances: {}
	};

	var promises = [];

	promises.push(db.getBTCBalance(req.user.btcAddress).then(btcBalance => response.body.balances.BTC = btcBalance/config.blockchain.btc.BTCtoSATOSHI));
	promises.push(db.getETHBalance(req.user.ethAddress).then(ethBalance => response.body.balances.ETH = ethBalance/config.blockchain.eth.ETHtoWEI));
	promises.push(db.getDNCBalance(req.user.ethAddress).then(dncBalance => response.body.balances.DNC = dncBalance/10));
	promises.push(db.getGSCBalance(req.user.ethAddress).then(balances => {
		for(var instrument in balances)
			response.body.balances[instrument] = balances[instrument];
	}));

	Promise.all(promises).then(() => {
		res.send(JSON.stringify(response));
		console.log("User data - ",response);
	}, err => {
		console.log("Get User Data failed - ",err);
		response.sucess = false;
		response.message = "invalidRequest",
		res.send(JSON.stringify(response));
	});
});

app.post('/api/v1/userops/get_user_metadata', authenticate, function(req,res) {
	var response = {};
	response.body = null;

	response.success = true;

	response.body = {
        email : req.user.email,
        dob: req.user.dob,
	    firstName : req.user.firstName,
    	lastName : req.user.lastName,
    	address: req.user.address1,
    	address2: req.user.address2,
    	city: req.user.city,
    	state: req.user.state,
    	country: req.user.country,
    	postalCode: req.user.postalCode,
    	phoneNumber: req.user.phNumber
	};

	res.send(JSON.stringify(response));
});

app.post('/api/v1/userops/modify_user',authenticate, (req,res) => {
	var response = {success:false};

	console.log("Received modify request: ",req.body);

	var dob_str = req.body.dob.split("/");
	var dob = new Date(dob_str[2],dob_str[1]-1,dob_str[0]);

	req.body.dob = dob;

	req.user.update({
		email: req.body.email,
		dob: req.body.dob,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		address1: req.body.address,
		address2: req.body.address2,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
		postalCode: req.body.postalCode,
		phNumber: req.body.phoneNumber,
		kyc:true
	}).then(() => {
		console.log("User modified successfully.");
		response.success = true;
		res.send(JSON.stringify(response));
	}, err => {
		console.log("User modification failed for request ",req.body);
		response.success = false;
		res.send(JSON.stringify(response));
	})
});

app.post('/api/v1/userops/reset_password_confirm', (req,res) => {
	try {
		db.models.models.User.findAll({
			where: {email: req.body.email}
		}).then((users) => {
			if(users.length <= 0) {
				res.send(JSON.stringify({
					success:false,
					msg: "invalidEmail"
				}));
			} else {
				if(users[0].password.substring(0,5) != req.body.code) {
					res.send(JSON.stringify({
						success:false,
						msg: "invalidCode"
					}))
				} else {
					users[0].update({
						password: crypto.sha512(req.body.pwd, users[0].salt)['passwordHash']
					}).then(() => {
						res.send(JSON.stringify({
							success:true,
							msg:""
						}))
					}, (err) => {
						console.log("Error in reset password confirm - ", err);
						res.send(JSON.stringify({
							success: false,
							msg: "InvalidEmail"
						}));
					})
				}
			}
		});
	} catch(exception) {
		console.log("Exception in reset password: ",exception);
		res.send(JSON.stringify({
			success:false,
			msg: "invalidEmail"
		}));
	}
});

app.post('/api/v1/userops/reset_password', (req,res) => {
	try {
		db.models.models.User.findAll({
			where: {email: req.body.email}
		}).then((users) => {
			if(users.length <= 0) {
				res.send(JSON.stringify({
					success:false,
					msg: "invalidEmail"
				}));
			}
			else {
				console.log("User found, sending email..");
				postmarkClient.sendEmail({
					"From": "noreply@universalblockchains.com",
					"To":   req.body.email,
					"Subject": "DinarDirham Password Reset Code",
					"HtmlBody": "Hi "+users[0].firstName+",<br />Your password reset code is <b>"+users[0].password.substring(0,5)+"</b><br />Please go to <a href='https://universalblockchains.com/resetpassword'>http://universalblockchains.com/resetpassword</a> to reset your password.<br /><br/>DinarDirham Team"
				},(error, result) => {
					if(error) {
						res.send(JSON.stringify({
							success:false,
							msg: "invalidEmail"
						}));
					} else {
						console.log("Email sent for password recovery.");
						res.send(JSON.stringify({
							success:true,
							code: "2",
							msg: ""
						}));
					}
				} );
			}
		})
	} catch(exception) {
		console.log("Exception in reset password: ",exception);
		res.send(JSON.stringify({
			success:false,
			msg: "invalidEmail"
		}));
	}
});

app.all('/api/v1/util/get_prices', (req,res) => {
	var response = {};
	var promises = [];

	promises.push(db.getETH().getPrice().then(price => response.ETH = price));
	promises.push(btc.getPrice().then(price => response.BTC = price));
	promises.push(mt4.getDNCPrice().then(price => response.DNC = price));

	config.contracts.instruments.forEach(instrument => 
		promises.push(mt4.getGSCPrice(instrument[0]).then(price => response[instrument[0]] = price)));

	Promise.all(promises).then(() => {
		// // Add 5% to sell and buy
		// response.DNC.ask *= 1.05;
		// response.DNC.bid *= 0.95;
		// response.BTC *= 1.05;
		// response.ETH *= 1.05;
		res.send(JSON.stringify(response));
	}, err => {
		console.log("Get Prices Failed - ",err);

		res.send(JSON.stringify({success:false, msg:"Get Prices Failed", err:err})); //TODO: Move
	});
});

app.post('/api/v1/admin/mint_DNC', authenticateAdmin, (req, res) => {
	try {
		req.body.amount = parseInt(parseFloat(req.body.amount)*10);

		var response = {success: false, message: null, body: null};
		if(typeof req.body.amount != 'number' || req.body.amount < 0 || req.body.amount == NaN)
			throw "Invalid Amount in admin buy DNC";

		var dnc = req.body.amount;

		console.log("Admin minting DNC - ",dnc);

		db.mintNewDNC(req.user.ethAddress, dnc).then(txAddress => {
			response.body = txAddress;
			response.success = true;
			response.message = null;
			res.send(JSON.stringify(response));
		}, err => {
			console.log("Admin MintDNC error - ",err);
			response.message = "invalidResponse";
			res.send(JSON.stringify(response));
		});
	} catch(exception) {
		console.log("Exception in Admin buy DNC - ",exception);
		res.send(JSON.stringify({success:false, message: "invalidRequest", body:null}));
	}	
});

app.post('/api/v1/walletops/buy_DNC', authenticate, (req, res) => {
	req.body.amount = parseInt(parseFloat(req.body.amount)*10);
	try {
		var response = {success: false, message: null, body: null};
		console.log("User email is ",req.user.email);
		if(blocked_emails.emails.includes(req.user.email)) {
			console.log("User in Blocked emails. Cancelling transaction.");
			res.send(JSON.stringify(response));
		} else {
			if(typeof req.body.amount != 'number' || req.body.amount < 0 || req.body.amount == NaN)
				throw "Invalid Amount in buy DNC";

			if(req.body.fromCurrency == 'ETH') {
				Promise.all([mt4.getDNCPrice(), db.getETH().getPrice()]).then(([DNCPrice, ETHPrice]) => {
					var dnc = req.body.amount;
					var wei = (((dnc/10) * DNCPrice.bid)/ETHPrice) * config.blockchain.eth.ETHtoWEI;
					console.log("DNC - ",dnc,", DNC Bid - ",DNCPrice.bid, ", ETHPrice - ",ETHPrice,", ETHtoWEI - ",config.blockchain.eth.ETHtoWEI);
					console.log("ETH total - ",wei);
					db.withdrawETH(req.user, wei).then(txAddress => {
						mt4.buyDNC(req.body.amount).then(mt4_ret => {
							console.log("MT4 Buy Order Placed - ",mt4_ret);
							return db.mintNewDNC(req.user.ethAddress, dnc);
						}).then(txAddress2 => {
							response.body = txAddress2;
							response.success = true;
							response.message = null;
							res.send(JSON.stringify(response));						
						}, err => {
							//TODO: Rollback the minting.
							response.message = "invalidResponse";
							console.error("FATAL ERROR: Unable to mint after withdrawal - ",err);
							res.send(JSON.stringify(response));
						});
					}, err => {
						response.message = err;
						console.log("Error in Buy DNC - ",err);
						res.send(JSON.stringify(response));
					})
				});
			}
			else if(req.body.fromCurrency == "BTC") {
				Promise.all([mt4.getDNCPrice(), btc.getPrice()]).then(([DNCPrice, BTCPrice]) => {
					var dnc = req.body.amount;
					var satoshi = (((dnc/10) * DNCPrice.bid)/BTCPrice) * config.blockchain.btc.BTCtoSATOSHI;

					console.log("DNC - ",dnc," is worth ",(satoshi/config.blockchain.btc.BTCtoSATOSHI)," BTC");

					db.withdrawBTC(req.user, satoshi).then(txAddress => {
						mt4.buyDNC(req.body.amount).then(mt4_ret => {
							console.log("MT4 Buy Order Placed - ",mt4_ret);
							return db.mintNewDNC(req.user.ethAddress, dnc);
						}).then(txAddress2 => {
							response.body = txAddress2;
							response.success = true;
							response.message = null;
							res.send(JSON.stringify(response));
						}, err => {
							response.message = "invalidResponse";
							console.error("FATAL ERROR: Unable to mint after withdrawal - ",err);
							res.send(JSON.stringify(response));
						});
					}, err => {
						response.message = err;
						console.log("Error in Buy DNC - ",err);
						res.send(JSON.stringify(response));
					});
				});
			}
			else {
				response.message = "invalidCurrency";
				res.send(JSON.stringify(response));
			}
		}
	} catch(exception) {
		console.log("Exception in buy DNC - ",exception);
		res.send(JSON.stringify({success:false, message: "invalidRequest", body:null}));
	}
});

app.post('/api/v1/admin/burn_DNC', authenticateAdmin, (req, res) => {
	try {
		req.body.amount = parseInt(parseFloat(req.body.amount)*10);

		var response = {success: false, message: null, body: null};

		if(typeof req.body.amount != 'number' || req.body.amount < 0 || req.body.amount == NaN)
			throw "Invalid Amount in admin sell DNC";

		var dnc = req.body.amount;

		console.log("Admin burning DNC - ",dnc);

		db.burnDNC(req.user.ethAddress, dnc).then(txAddress => {
			response.body = txAddress;
			response.success = true;
			response.message = null;
			res.send(JSON.stringify(response));
		}, err => {
			console.log("Admin BurnDNC error - ",err);
			response.message = err;
			res.send(JSON.stringify(response));
		});
	} catch(exception) {
		console.log("Exception in Admin sell DNC - ",exception);
		res.send(JSON.stringify({success:false, message: "invalidRequest", body:null}));
	}	
});

app.post('/api/v1/walletops/sell_DNC', authenticate, (req, res) => {
	var response = {success: false, message: null, body: null};
	if(blocked_emails.emails.includes(req.user.email)) {
		console.log("User in Blocked emails. Cancelling transaction.");
		res.send(JSON.stringify(response));
	} else {
		req.body.amount = parseInt(parseFloat(req.body.amount)*10);
		try {
			if(typeof req.body.amount != "number" || req.body.amount < 0 || req.body.amount == NaN)
				throw "Invalid Amount";
			var dnc = req.body.amount;
			if(req.body.toCurrency == 'ETH') {
				Promise.all([mt4.getDNCPrice(), db.getETH().getPrice()])
					.then(([DNCPrice, ETHPrice]) => {
						var wei = (((dnc/10) * DNCPrice.ask)/ETHPrice) * config.blockchain.eth.ETHtoWEI;
						return wei;
					}).then(wei => {
						return db.getETHBalance(config.get('blockchain.eth.sendAddress')).then(balance => {
							if(balance < wei) {
								console.log("Balance in admin ETH Account - ",balance," needed to send ",wei, "mismatch.");
								console.log("Not enough balance in admin ETH account to sell DNC");
								return Promise.reject("insufficientAdminFunds");
							}
							return wei;
						});
					}).then(wei => {
						return mt4.sellDNC(dnc).then(mt4_ret => {
							console.log("mt4 sell order returned ", mt4_ret);
							return wei;
						});
					}).then(wei => {
						return db.burnDNC(req.user.ethAddress, dnc).then(txAddress => {return [wei, txAddress]});
					}).then(([wei, txAddress]) => {
						return db.depositETH(req.user, wei).then(txAddress2 => {return txAddress;});
					}).then(txAddress => {
						response.success = true;
						response.body = txAddress;
						res.send(JSON.stringify(response));
					}).catch(err => {
						console.log("Burn DNC Failed with error ",err);
						response.message = err;
						res.send(JSON.stringify(response));
					});
			} else if(req.body.toCurrency == 'BTC') {
				Promise.all([mt4.getDNCPrice(), btc.getPrice()])
					.then(([DNCPrice, BTCPrice]) => {
						var satoshi = (((dnc/10) * DNCPrice.ask)/BTCPrice) * config.blockchain.btc.BTCtoSATOSHI; 
						return satoshi;
					}).then(satoshi => {
						return bitgoapi.getAdminBalance().then(balance => {
							if(balance < satoshi) {
								console.log("Not enough balance in admin BTC account to sell DNC");
								return Promise.reject("insufficientAdminFunds");							
							}
							return satoshi;
						})
						// return db.getBTCBalance(config.blockchain.btc.sendAddress).then(balance => {
						// 	if(balance < satoshi) {
						// 		console.log("Not enough balance in admin BTC account to sell DNC");
						// 		return Promise.reject("insufficientAdminFunds");
						// 	}
						// 	return satoshi;
						// });
					}).then(satoshi => {
						return mt4.sellDNC(dnc).then(mt4_ret => {
							console.log("mt4 sell order returned ", mt4_ret);
							return satoshi;
						});
					}).then(satoshi => {
						return db.burnDNC(req.user.ethAddress, dnc).then(txAddress => {return [satoshi, txAddress]});
					}).then(([satoshi, txAddress]) => {
						return db.depositBTC(req.user.btcAddress, satoshi).then(txAddress2 => {return txAddress});
					}).then(txAddress => {
						console.log("Success..");

						response.success = true;
						response.body = txAddress;
						res.send(JSON.stringify(response));
					}).catch(err => {
						console.log("Burn DNC Failed with error ",err);
						if(err[0] == 'f') {
							response.message = "ticket"
							response.ticketID = err.substring(1,11);
						}
						else
							response.message = err;
						postmarkClient.sendEmail({
							"From": "noreply@universalblockchains.com",
							"To":   config.auth.supportEmail,
							"Subject": "BTC Transfer Support Ticket ID "+err.substring(1,11),
							"HtmlBody": "A bitcoin transfer has failed and a support ticket ID "+err.substring(1,11)+" has been opened. <br /><br /> Details - <br />"+err.substring(11)
						},(error, result) => {
							if(error) {
								console.log("Support email failed.");
							} else {
								console.log("Support email successful.");
							}
						} );
						console.log("BurnDNC Response - ",response);
						res.send(JSON.stringify(response));
					});
			} else {
				response.message = "invalidCurrency";
				res.send(JSON.stringify(response))
			}
		} catch(exception) {
			console.log("Exception in sell DNC - ", exception);
			response.message = "invalidRequest";
			res.send(JSON.stringify(response));
		}
	}
});

app.post('/api/v1/walletops/send_DNC', authenticate, (req, res) => {
	var response = {success: false, message: null, body: null};
	if(blocked_emails.emails.includes(req.user.email)) {
		console.log("User in Blocked emails. Cancelling transaction.");
		res.send(JSON.stringify(response));
	} else {
		try {
			var user = req.user;
			db.transferDNC(user.ethAddress, req.body.toAddress, parseInt(parseFloat(req.body.amount)*10)).then(txAddress => {
				response.body = txAddress;
				response.success = true;
				res.send(JSON.stringify(response));
			}, err => {
				response.message = err;
				res.send(JSON.stringify(response));
			});
		} catch(exception) {
			console.log("Exception occurred in send DNC - ", exception);
			response.message = "invalidRequest";
			res.send(JSON.stringify(response));
		}
	}
});

app.post('/api/v1/walletops/buy_GSC', authenticate, (req, res) => {
	var response = {success: false, message: null, body: null};
	req.body.amount = parseInt(req.body.amount);
	try {
		if(typeof req.body.amount != 'number' || req.body.amount < 0 || req.body.amount == NaN)
			throw "Malformed input in buy GSC";
		if(config.contracts.instruments.filter(a => a[0] == req.body.instrument).length <= 0)
			throw "invalid Instrument";

		if(req.body.fromCurrency == "ETH") {
			Promise.all([mt4.getGSCPrice(req.body.instrument), db.getETH().getPrice()]).then(([GSCPrice, ETHPrice]) => {
				var wei = ((req.body.amount * GSCPrice.bid)/ETHPrice) * config.blockchain.eth.ETHtoWEI;
				return db.withdrawETH(req.user, wei);
			}).then(txAddress => {
				return db.mintNewGSC(req.user.ethAddress, req.body.instrument, req.body.amount);
			}).then(txAddress2 => {
				response.body = txAddress2;
				response.success = true;
				response.message = null;
				res.send(JSON.stringify(response));
			}).catch(err => {
				console.log("Error in Buy GSC - ",err);
				response.message = err;
				res.send(JSON.stringify(response));
			});
		} else if(req.body.fromCurrency == "BTC") {
			Promise.all([mt4.getGSCPrice(req.body.instrument), btc.getPrice()]).then(([GSCPrice, BTCPrice]) => {
				var satoshi = ((req.body.amount * GSCPrice.bid)/BTCPrice) * config.blockchain.btc.BTCtoSATOSHI;
				return db.withdrawBTC(req.user, satoshi);
			}).then(txAddress => {
				return db.mintNewGSC(req.user.ethAddress, req.body.instrument, req.body.amount);
			}).then(txAddress2 => {
				response.body = txAddress2;
				response.success = true;
				response.message = null;
				res.send(JSON.stringify(response));
			}).catch(err => {
				console.log("Error in Buy GSC - ",err);
				response.message = err;
				res.send(JSON.stringify(response));
			});
		} else {
			response.message = "invalidCurrency";
			res.send(JSON.stringify(response));
		}
	} catch(exception) {
		console.log("Exception in buy GSC - ", exception);
		response.message = "invalidRequest";
		res.send(JSON.stringify(response));
	}
});

app.post('/api/v1/walletops/sell_GSC', authenticate, (req, res) => {
	var response = {success: false, message: null, body: null};
	req.body.amount = parseInt(req.body.amount);
	try {
		if(typeof req.body.amount != 'number' || req.body.amount < 0 || req.body.amount == NaN)
			throw "Malformed input in buy GSC";
		if(config.contracts.instruments.filter(a => a[0] == req.body.instrument).length <= 0)
			throw "invalid Instrument";

		var gsc = req.body.amount;
		if(req.body.toCurrency == 'ETH') {
			Promise.all([mt4.getGSCPrice(req.body.instrument), db.getETH().getPrice()])
				.then(([GSCPrice, ETHPrice]) => {
					var wei = ((req.body.amount * GSCPrice.ask)/ETHPrice) * config.blockchain.eth.ETHtoWEI;
					return wei;
				}).then(wei => {
					return db.burnGSC(req.user.ethAddress, req.body.instrument, gsc).then(txAddress => {return [wei, txAddress]});
				}).then(([wei, txAddress]) => {
					return db.depositETH(req.user, wei).then(txAddress2 => {return txAddress;});
				}).then(txAddress => {
					response.success = true;
					response.body = txAddress;
					res.send(JSON.stringify(response));
				}).catch(err => {
					console.log("Burn GSC Failed with error ",err);
					response.message = err;
					res.send(JSON.stringify(response));
				});
		} else if(req.body.toCurrency == 'BTC') {
			Promise.all([mt4.getGSCPrice(req.body.instrument), btc.getPrice()])
				.then(([GSCPrice, BTCPrice]) => {
					var satoshi = ((req.body.amount * GSCPrice.ask)/BTCPrice) * config.blockchain.btc.BTCtoSATOSHI;
					return satoshi;
				}).then(satoshi => {
					return db.burnGSC(req.user.ethAddress, req.body.instrument, gsc).then(txAddress => {return [satoshi, txAddress]});
				}).then(([satoshi, txAddress]) => {
					return db.depositBTC(req.user.btcAddress, satoshi).then(txAddress2 => {return txAddress;});
				}).then(txAddress => {
					response.success = true;
					response.body = txAddress;
					res.send(JSON.stringify(response));
				}).catch(err => {
					console.log("Burn GSC Failed with error ",err);
					response.message = err;
					res.send(JSON.stringify(response));
				});
		} else {
			response.message = "invalidCurrency";
			res.send(JSON.stringify(response))
		}
	} catch(exception) {
		console.log("Exception in sell GSC - ", exception);
		response.message = "invalidRequest";
		res.send(JSON.stringify(response));
	}
});

app.post('/api/v1/walletops/send_ETH', authenticate, (req, res) => {
	var response = {success: false, message: null, body: null};
	if(blocked_emails.emails.includes(req.user.email)) {
		console.log("User in Blocked emails. Cancelling transaction.");
		res.send(JSON.stringify(response));
	} else {
		try {
			var user = req.user;
			db.transferETH(user, req.body.toAddress, req.body.amount * config.blockchain.eth.ETHtoWEI).then(txAddress => {
				response.success = true;
				response.body = txAddress;
				res.send(JSON.stringify(response));
			}, err => {
				response.message = err;
				res.send(JSON.stringify(response));
			});
		} catch(exception) {
			console.log("Exception occurred in sell_DNC - ", exception);
			response.message = "invalidRequest";
			res.send(JSON.stringify(response));
		}
	}
});

app.post('/api/v1/walletops/send_BTC', authenticate, (req, res) => {
	var response = {success: false, message: null, body: null};
	if(blocked_emails.emails.includes(req.user.email)) {
		console.log("User in Blocked emails. Cancelling transaction.");
		res.send(JSON.stringify(response));
	} else {
		try {
			var user = req.user;
			console.log("minerFee in sendBTC is ",req.body.minerFee);
			db.transferBTC(req.user, req.body.toAddress, req.body.amount * config.blockchain.btc.BTCtoSATOSHI, null, req.body.minerFee * config.blockchain.btc.BTCtoSATOSHI).then(txAddress => {
				response.success = true;
				response.body = txAddress;
				res.send(JSON.stringify(response));
			}, err => {	
				console.log("BTC Transfer returned error ",err);
				response.message = err;
				res.send(JSON.stringify(response));
			});
		} catch(exception) {
			console.log("Exception occurred in send_BTC - ", exception);
			response.message = "invalidRequest";
			res.send(JSON.stringify(response));
		}
	}
});

app.post('/api/v1/userops/add_btc_address', authenticate, (req, res) => {
	var response = {success: false, msg: "failedtoAdd"};
	req.user.update({privateBtcAddress: req.body.address}).then(() => {
		response.success = "true";
		response.msg = "addedAddress";
		console.log("Added btc address ", req.body.address);
		console.log(req.body);
		res.send(JSON.stringify(response));
	}, err => {
		console.log("Error in Adding bitcoin address - ", err);
		res.send(JSON.stringify(response));
	})
});

app.post('/api/v1/userops/add_eth_address', authenticate, (req, res) => {
	var response = {success: false, msg: "failedtoAdd"};
	req.user.update({privateEthAddress: req.body.address}).then(() => {
		response.success = "true";
		response.msg = "addedAddress";
		console.log(req.body);
		res.send(JSON.stringify(response));
	}, err => {
		console.log("Error in Adding Ethereum address - ", err);
		res.send(JSON.stringify(response));
	})
});

app.post('/api/v1/userops/get_transactions', authenticate, (req, res) => {
	var transactions = {BTC:[],ETH:[], DNC:[],GSC:[]};

	var promises = [
		db.models.models.Transaction.findAll({where: 
			{targetAddress:req.user.btcAddress, funcName:["depositBTC","transferBTC","withdrawBTC"]}}),
		db.models.models.Transaction.findAll({where: 
			{targetAddress:req.user.ethAddress, funcName:["depositETH","transferETH","withdrawETH"]}}),
		db.models.models.Transaction.findAll({where: 
			{targetAddress:req.user.ethAddress, funcName:["mint","transfer","burn"], 
			contractAddress:db.getETH().getGoldBank().instance.address}}),
		db.models.models.Transaction.findAll({where: 
			{targetAddress:req.user.ethAddress, funcName:["mint","transfer","burn"], 
			contractAddress:db.getETH().getGSCBank().instance.address}})		
	];

	//TODO: Revise, add public blockchain pulls as well as pagination
	//TODO: Consider reducing load on database
	Promise.all(promises).then(([btcTxs, ethTxs, dncTxs, gscTxs]) => {
		res.send(JSON.stringify({
			BTC:btcTxs.map(tx=>tx.toJSON()), 
			ETH:ethTxs.map(tx=>tx.toJSON()), 
			DNC:dncTxs.map(tx=>tx.toJSON()),
			GSC:gscTxs.map(tx=>tx.toJSON())}));
	}, err => {
		console.log("Error in getting transactions - ",err);
		res.send(JSON.stringify({success:false, message:"invalidResponse"}));
	});
});

// db.connect().then(function(msg) {
// 	app.listen(8080, function() {
// 		console.log("Listening on port 8080!");
// 	});
// }, (err) => {
// 	console.log("Database connect failed - ",err);
// })

db.connect().then(function(msg) {
		// https.createServer({
		// 	      key: fs.readFileSync(config.get("auth.ssl.key")),
		// 	      cert: fs.readFileSync(config.get("auth.ssl.cert")),
		// 	      passphrase: config.get("auth.ssl.password")
		// 	    }, app).listen(config.get("port"));

		// console.log("Https listening on port "+config.get("port"));

		app.listen(9090, 'localhost', function () {
		  console.log('Http listening on port 9090!')
		})


	}, function(err) {
	console.log("Database connect failed - exiting with message ",err);
});

exports.instance = app;

// Error handling
app.use(function (err, req, res, next) {
  console.log("Error in operation - ",err.stack);
  if(!res.headersSent)
  	res.status(500).send({message: "invalidRequest"});
});