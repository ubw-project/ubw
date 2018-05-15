var bitcoinjs = require('bitcoinjs-lib');
var request = require('request');
var config = require('config');

exports.getPrice = function() {
    return new Promise(function(resolve, reject) {
        request('http://api.coindesk.com/v1/bpi/currentprice.json', function(err, res, body) {
            if(res.statusCode == 200) {
                resolve(JSON.parse(body).bpi.USD.rate_float);
            } else {
                console.log("Price getting failed");
                reject();
            }
        });
    });
}

exports.setTxLogger = function(txLogger) {
    exports.txLogger = txLogger;
}

exports.createAddress = function() {
    return new Promise(function(resolve, reject) {
        try {
            var keyPair = bitcoinjs.ECPair.makeRandom({network: bitcoinjs.networks.testnet});
            resolve({address: keyPair.getAddress(), key: keyPair.toWIF()});
        } catch(exception) {
            reject(exception)
        }
    });
}

exports.transfer = function(fromWIF, toAddress, amount, pendingTxs) {
    amount = Math.floor(amount);
    console.log("BTC Transfer with toAddress ",toAddress);
    return new Promise((resolve, reject) => {
        try {
            var fromKeyPair = bitcoinjs.ECPair.fromWIF(fromWIF, bitcoinjs.networks.testnet);

            //get UTXOs
            exports.getUTXOs(fromKeyPair.getAddress(),pendingTxs).then(utxos => {
                if(utxos.length <= 0) {
                    console.log("Found no UTXOs for address ", fromKeyPair.getAddress());
                    reject("insufficientFunds");
                    return;
                }

                runningTotal = 0;

                var transaction = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.testnet);
                txcount = 0;
                for(tx in utxos) {
                    if(runningTotal >= amount + config.blockchain.btc.minerFee) break;

                    console.log("Adding tx "+utxos[tx]);
                    runningTotal += Math.floor(utxos[tx].amount * config.blockchain.btc.BTCtoSATOSHI);
                    console.log("Added ",Math.floor(utxos[tx].amount * config.blockchain.btc.BTCtoSATOSHI)," satoshis to transaction to make runningTotal ",runningTotal);
                    transaction.addInput(utxos[tx].tx, utxos[tx].n);
                	console.log("Added input.");
                    txcount++;
                }

                try {
	                console.log("Adding output - (",toAddress,",",amount,")");

	                transaction.addOutput(toAddress, amount);
	              	console.log("Adding additional outputs...");
	                if(runningTotal > amount + config.blockchain.btc.minerFee)
	                    transaction.addOutput(fromKeyPair.getAddress(), runningTotal - amount - config.blockchain.btc.minerFee);
	            } catch(exception) {
	            	console.log("Exception - ",exception);
	            	reject(exception);
	            }


                console.log("Signing...");
                for(i=0;i<txcount;i++)
                    transaction.sign(i, fromKeyPair);

                 // transaction.sign(0, fromKeyPair);
                console.log("Transaction Built - ");
                console.log(transaction.build().toHex());

                console.log("Sending bitcoin to the blockchain");
                request({
                    url: 'http://tbtc.blockr.io/api/v1/tx/push',
                    method: "POST",
                    json: {hex: transaction.build().toHex()}
                },
                function (err, res, body) {
                    if (!err && (res.statusCode >= 200 && res.statusCode < 300)) {
                        console.log("Success - body is ",body);
                        resolve(body.data);
                    }
                    else {
                        console.log("Error in pushing tx to blockchain - ",err,", response - ",res," body - ",body);
                        reject("insufficientFunds");
                    }
                });
            }, err => reject(err));
        } catch (exception) {
            console.log("Bitcoin transfer failed with error - ",exception);
            reject("insufficientFunds");
        }        
    });
}

exports.getBalance = function(address) {
    return new Promise(function(resolve, reject) {
        try {
            request('http://tbtc.blockr.io/api/v1/address/balance/'+address+'?confirmations=2', (err, res, body) => {
                if(res.statusCode == 200) {
                    resolve(JSON.parse(body).data.balance * config.blockchain.btc.BTCtoSATOSHI);
                } else {
                    console.log("Bitcoin getBalance for address ",address," failed with ", res.statusCode);
                    reject();
                }
            });
        } catch(exception) {
            console.log("Exception in BTC getBalance - ",exception);
            reject();
        }
    });
}

exports.getUTXOs = function(address, pendingTxs) {
	return new Promise((resolve, reject) => {
		request('http://tbtc.blockr.io/api/v1/address/unspent/'+address+'?unconfirmed=1', (err, res, body) => {
			if(res.statusCode == 200) {
				// resolve(JSON.parse(body));

				utxos = JSON.parse(body).data.unspent;

				promises = [];
				utxos.forEach(utxo => promises.push(exports.getTX(utxo.tx)));
				if(pendingTxs != undefined) pendingTxs.forEach(pendingTx => promises.push(exports.getTX(pendingTx)));

				Promise.all(promises).then(utxo_detail => {

					vins = []
					utxo_detail.forEach(utxo => utxo.data.vins.forEach(vin => vins.push(vin.vout_tx)));


					unspent_utxos = [];

					utxo_detail.forEach(utxo => {
						utxo.data.vouts.forEach(vout => {
							if(vout.address == address && vins.indexOf(utxo.data.tx) == -1)
								unspent_utxos.push({
									tx: utxo.data.tx,
									amount: vout.amount,
									n: vout.n,
									type: vout.type,
									confirmations: utxo.data.confirmations
								});
						});
					});

					// utxos.forEach(utxo => {if(vins.indexOf(utxo.tx) == -1) unspent_utxos.push(utxo)}); 

					resolve(unspent_utxos);
				}, err => {
					console.log("Error getting tx details - ", err);
					reject(err);
				});
			}
			else
				reject(err);
		})
	});
}

exports.getTX = function(txAddress) {
	return new Promise((resolve, reject) => {
		request('http://tbtc.blockr.io/api/v1/tx/info/'+txAddress, (err, res, body) => {
			if(res.statusCode == 200)
				resolve(JSON.parse(body));
			else
				reject(err);
		});
	});
}

exports.txMined = function(txAddress) {
	return new Promise((resolve, reject) => {
		request('http://tbtc.blockr.io/api/v1/tx/info/'+txAddress, (err, res, body) => {
			if(res.statusCode != 200)
				reject();
			else
				resolve(JSON.parse(body).data.confirmations > 1);
		});
	})
}
