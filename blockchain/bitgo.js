var config = require('config');
var BitGoJS = require('bitgo');


var bitgo = new BitGoJS.BitGo({ env: 'prod', accessToken: config.blockchain.btc.BitGoToken });

exports.getBalance = function(address) {
	return new Promise((resolve, reject) => {
		bitgo.blockchain().getAddress({ address: address }, function(err, response) {
		  if (err) { console.log(err); reject(err); process.exit(-1); }
		  resolve(response['confirmedBalance']); 
		});
	});
}

exports.getAdminBalance = function() {
	return new Promise((resolve, reject) => {
		bitgo.wallets().get({type:'bitcoin',id:config.blockchain.btc.BitGoAdminSend},(err, wallet)=>{
			if(err) reject(err);
			else resolve(wallet.balance());
		});
	})
}

exports.sendAdminBalance = function(amount, toAddress) {
	amount = parseInt(amount);
	return new Promise((resolve, reject) => {
		bitgo.wallets().get({ type: 'bitcoin', id: config.blockchain.btc.BitGoAdminSend }, function(err, wallet) {
			if(err) {
				console.log("Error in BitGo sendAdminBalance getWallet- ",err);
				reject(err);
			}
			else {
				wallet.sendCoins({ address: toAddress,
					amount: amount, walletPassphrase: config.blockchain.btc.BitGoPass, minConfirms: 0 },
					function(err, result) {
						if(err) {
							console.log("Error in BitGo sendAdminBalance send - ",err);
							reject(err);
						}
						else {
							// console.log("Succeeded. TxHash - ",result['hash'],"Result - ",result);
							resolve(result['hash']);
						}
					}
				);
			}
		});
	})
}
