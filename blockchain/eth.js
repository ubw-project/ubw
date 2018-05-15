var Web3 = require('web3');
var config = require('config');
var goldBank = require('./contracts/goldBank.js');
var GSCBank = require('./contracts/GSCBank.js');
var request = require('request')

exports.web3 = new Web3();

exports.web3.setProvider(new exports.web3.providers.HttpProvider(config.get('blockchain.eth.nodeAddress')));

goldBank.init(exports.web3);
GSCBank.init(exports.web3);

if(!config.has('contracts.goldBankAddress')) {
	console.log("No goldbank has been created.");
}
if(!config.has('contracts.GSCBankAddress')) {
	console.log("No gscbank has been created.");
}

// TODO: Remove these two lines after testing
exports.getGoldBank = function() { return goldBank; }
exports.getGSCBank = function() { return GSCBank; }

exports.setTxLogger = function(txLogger) {
	goldBank.setTxLogger(txLogger);
	GSCBank.setTxLogger(txLogger);
}

exports.getPrice = function() {
	return new Promise((resolve, reject) => {
	 	request('https://poloniex.com/public?command=returnTicker',
			(err,res,body)=>{
				if(res.statusCode==200) {
					try {
						var unfilteredData = JSON.parse(body);
						if(unfilteredData['USDT_ETH']['last'])
							resolve(unfilteredData['USDT_ETH']['last']);
						else
							reject("No ETHPrice");
					} catch(exception) {
						reject(exception);
					}
				} else
					reject("Get ETHPrice returned - ",res.statusCode);
			}
		);
	});
}

exports.getBalance = function(address) {
	return new Promise((resolve, reject) => {
		try {
			resolve(exports.web3.eth.getBalance(address));
		} catch (exception) {
			reject(exception);
		}
	});
}	

exports.newAccount = function(password) {
	var acc = exports.web3.personal.newAccount(password);
	return Promise.all([
		goldBank.createUser(acc, acc, acc),
		GSCBank.createUser(acc, acc, acc)
		]).then(values => {return Promise.resolve(acc);}, err => reject(err));
}

exports.justAccount = function(password) {
	return Promise.resolve(exports.web3.personal.newAccount(password));
}

exports.txMined = function(address) {
	tx = exports.web3.eth.getTransaction(address);
	if(tx == null) return null;
	if(tx.blockNumber == null) return false;
	else return true;
}

exports.empty = function(fromAddress, password, toAddress) {
	var gasPrice = 21000000000;
	var gas = 21000;

	return new Promise((resolve, reject) => {
		exports.getBalance(fromAddress).then(balance => {
			exports.web3.personal.unlockAccount(fromAddress, password);
			exports.web3.eth.sendTransaction({
				from:fromAddress,
				to:toAddress,
				gas:gas,
				gasPrice:gasPrice,
				value:(balance-(gas*gasPrice))-1000
			}, (err, txAddress) => {
				if(err)
					reject(err);
				else
					resolve(txAddress);
			});
		});
	});
}
