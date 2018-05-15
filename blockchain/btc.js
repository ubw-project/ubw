var bitcoinjs = require('bitcoinjs-lib');
var request = require('request');
var config = require('config');
var crypto = require('../crypto.js');
var fs = require('fs');

exports.getPrice = function() {
    return new Promise(function(resolve, reject) {
        request('https://api.coinbase.com/v2/prices/spot?currency=USD', function(err, res, body) {
            if(res.statusCode == 200) {
                resolve(JSON.parse(body).data.amount);
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
            var keyPair = bitcoinjs.ECPair.makeRandom();
            resolve({address: keyPair.getAddress(), key: keyPair.toWIF()});
        } catch(exception) {
            reject(exception)
        }
    });
}

exports.transfer = function(fromWIF, toAddress, amount, pendingTxs, minerFee) {
    amount = Math.floor(amount);

    return new Promise((resolve, reject) => {
        try {        
            if(minerFee == undefined || isNaN(minerFee)) {
                exports.getBTCFee().then(btcFee => {
                    if(btcFee == undefined || isNaN(minerFee)) exports.transfer(fromWIF, toAddress, amount, pendingTxs, config.blockchain.btc.minerFee).then(resolve, reject);
                    else
                        exports.transfer(fromWIF, toAddress, amount, pendingTxs, btcFee).then(resolve, reject);
                })
            } else {
                var fromKeyPair = bitcoinjs.ECPair.fromWIF(fromWIF);

                console.log("BTC Transfer attempting to send ", amount, " to ", toAddress," minerFee is ", minerFee);

                //get UTXOs
                exports.getUTXOs(fromKeyPair.getAddress(),pendingTxs).then(utxos => {
                    if(utxos.length <= 0) {
                        console.log("Found no UTXOs for address ", fromKeyPair.getAddress());
                        reject("insufficientFunds");
                        return;
                    }

                    runningTotal = 0;

                    var transaction = new bitcoinjs.TransactionBuilder();
                    var transaction2 = new bitcoinjs.TransactionBuilder();
                    txcount = 0;
                    for(tx in utxos) {
                        if(runningTotal >= amount + minerFee) break;

                        console.log("Adding tx "+utxos[tx]);
                        runningTotal += Math.floor(utxos[tx].amount * config.blockchain.btc.BTCtoSATOSHI);
                        console.log("Added ",Math.floor(utxos[tx].amount * config.blockchain.btc.BTCtoSATOSHI)," satoshis to transaction to make runningTotal ",runningTotal);
                        console.log("Adding tx - ",utxos[tx].tx,", n - ",utxos[tx].n);
                        transaction.addInput(utxos[tx].tx, utxos[tx].n);
                        txcount++;
                        console.log("Added input.");
                    }

                    //TODO: kB estimation is hard, we're currently assuming 500b per tx
                    minerFee /= 2;

                    console.log("Adding output. minerFee is ",minerFee);
                    transaction.addOutput(toAddress, amount);
                    if(runningTotal > (amount + Number(minerFee))) {
                        transaction.addOutput(fromKeyPair.getAddress(), runningTotal - amount - minerFee);
                        console.log("Returned ", (runningTotal - amount - minerFee), "wei to sender.");
                    }

                    console.log("Signing..");
                    for(i=0;i<txcount;i++)
                        transaction.sign(i, fromKeyPair);

                     // transaction.sign(0, fromKeyPair);
                    console.log("Transaction Built - ");
                    console.log(transaction.build().toHex());

                    console.log("Sending bitcoin to the blockchain");
                    request({
                        url: 'http://btc.blockr.io/api/v1/tx/push',
                        method: "POST",
                        json: {hex: transaction.build().toHex()}
                    },
                    function (err, res, body) {
                        if (!err && (res.statusCode >= 200 && res.statusCode < 300)) {
                            console.log("Success - body is ",body);
                            resolve(body.data);
                        }
                        else {
                            console.log("Error in pushing tx to blockchain - ",err," body - ",body);
                            errID = crypto.genRandomString(10);
                            console.log("Error ID - ",errID);
                            errStr = 'BTC Send Error ID '+errID+' - from: '+fromKeyPair.getAddress()+', to: '+toAddress+', amount: '+amount;
                            fs.appendFile(config.logging.btc, 
                                errStr+'\n', function(err) {
                                if(err) console.log("Error in logging mt4 error - ",err);
                            })                            
                            reject("f"+errID+errStr);
                        }
                    });
                }, err => reject(err));
            }   
        } catch (exception) {
            console.log("Bitcoin transfer failed with error - ",exception);
            reject("insufficientFunds");
        }        
    });
}

// exports.transfer2 = function(fromWIF, toAddress, amount, pendingTxs, minerFee) {
//     amount = Math.floor(amount);

//     return new Promise((resolve, reject) => {
//         try {        
//             if(minerFee == undefined) {
//             } else {
//                 var fromKeyPair = bitcoinjs.ECPair.fromWIF(fromWIF);

//                 console.log("BTC Transfer attempting to send ", amount, " to ", toAddress," minerFee is ", minerFee);

//                 //get UTXOs
//                 exports.getUTXOs(fromKeyPair.getAddress(),pendingTxs).then(utxos => {
//                     if(utxos.length <= 0) {
//                         console.log("Found no UTXOs for address ", fromKeyPair.getAddress());
//                         reject("insufficientFunds");
//                         return;
//                     }

//                     runningTotal = 0;

//                     var transaction = new bitcoinjs.TransactionBuilder();
//                     txcount = 0;
//                     for(tx in utxos) {
//                         if(runningTotal >= amount + minerFee) break;

//                         console.log("Adding tx "+utxos[tx]);
//                         runningTotal += Math.floor(utxos[tx].amount * config.blockchain.btc.BTCtoSATOSHI);
//                         console.log("Added ",Math.floor(utxos[tx].amount * config.blockchain.btc.BTCtoSATOSHI)," satoshis to transaction to make runningTotal ",runningTotal);
//                         console.log("Adding tx - ",utxos[tx].tx,", n - ",utxos[tx].n);
//                         transaction.addInput(utxos[tx].tx, utxos[tx].n);
//                         txcount++;
//                         console.log("Added input.");
//                     }
//                     console.log("Adding output. minerFee is ",minerFee);

//                     // console.log("TX length before adding toAddress amount is ", transaction.build().toHex().length)

//                     transaction.addOutput(toAddress, amount);

//                     console.log("TX length after adding toAddress amount is ",transaction.build().toHex().length)

//                     if(runningTotal > (amount + Number(minerFee))) {
//                         transaction.addOutput(fromKeyPair.getAddress(), runningTotal - amount - minerFee);
//                         console.log("Returned ", (runningTotal - amount - minerFee), "wei to sender.");
//                     }

//                     console.log("TX Length after adding all is ", transaction.build().toHex().length)

//                     console.log("Signing..");
//                     for(i=0;i<txcount;i++)
//                         transaction.sign(i, fromKeyPair);

//                      // transaction.sign(0, fromKeyPair);
//                     console.log("Transaction Built - ");
//                     console.log(transaction.build().toHex());

//                     console.log("Sending bitcoin to the blockchain");

//                     resolve(transaction);
//                 }, err => reject(err));
//             }   
//         } catch (exception) {
//             console.log("Bitcoin transfer failed with error - ",exception);
//             reject("insufficientFunds");
//         }        
//     });
// }

//Disabled due to blockr.io phishing issue
// exports.getBalance = function(address) {
//     return new Promise(function(resolve, reject) {
//         try {
//             request('http://btc.blockr.io/api/v1/address/balance/'+address+'?confirmations=2', (err, res, body) => {
//                 if(res.statusCode == 200) {
//                     // console.log("Got balance of ",JSON.parse(body).data.balance);
//                     resolve(JSON.parse(body).data.balance * config.blockchain.btc.BTCtoSATOSHI);
//                 } else {
//                     console.log("Bitcoin getBalance for address ",address," failed with ", res.statusCode);
//                     reject();
//                 }
//             });
//         } catch(exception) {
//             console.log("Exception in BTC getBalance - ",exception);
//             reject();
//         }
//     });
// }

// exports.getBalance = function(address) {
//     return new Promise(function(resolve, reject) {
//         try {
//             request('https://api.blockcypher.com/v1/btc/main/addrs/'+address+'/balance', (err, res, body) => {
//                 if(res.statusCode == 200) {
//                     // console.log("Got balance of ",JSON.parse(body).data.balance);
//                     resolve(JSON.parse(body).balance);
//                 } else {
//                     console.log("Bitcoin getBalance for address ",address," failed with ", res.statusCode);
//                     console.log("Body is ",body);
//                     reject();
//                 }
//             });
//         } catch(exception) {
//             console.log("Exception in BTC getBalance - ",exception);
//             reject();
//         }
//     });
// }

exports.getBalance = function(address) {
    return new Promise(function(resolve, reject) {
        try {
            request('https://blockchain.info/address/'+address+'?format=json', (err, res, body) => {
                if(res.statusCode == 200) {
                    // console.log("Got balance of ",JSON.parse(body).data.balance);
                    resolve(JSON.parse(body).final_balance);
                } else {
                    console.log("Bitcoin getBalance for address ",address," failed with ", res.statusCode);
                    console.log("Body is ",body);
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
        request('http://btc.blockr.io/api/v1/address/unspent/'+address+'?unconfirmed=1', (err, res, body) => {
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

// exports.getBTCFee = function() {
//     return new Promise((resolve, reject) => {
//         request('https://shapeshift.io/btcfee', (err, res, body) => {
//             if(res.statusCode == 200) {
//                 resolve(Number(JSON.parse(body).recommendedFeeInSatoshi_btc));
//             }
//             else
//                 reject(err);
//         });
//     })
// }

exports.getBTCFee = function() {
    return new Promise((resolve, reject) => {
        request('https://www.bitgo.com/api/v1/tx/fee?numBlocks=10', (err, res, body) => {
            if(res.statusCode == 200) {
                resolve(Number(JSON.parse(body).feePerKb));
            }
            else
                reject(err);
        });
    })   
}

exports.getTX = function(txAddress) {
    return new Promise((resolve, reject) => {
        request('http://btc.blockr.io/api/v1/tx/info/'+txAddress, (err, res, body) => {
            if(res.statusCode == 200)
                resolve(JSON.parse(body));
            else
                reject(err);
        });
    });
}

exports.txMined = function(txAddress) {
    return new Promise((resolve, reject) => {
        request('http://btc.blockr.io/api/v1/tx/info/'+txAddress, (err, res, body) => {
            console.log("BTC TXMined response from blockr - ",res);
            if(res.statusCode != 200)
                resolve(null);
            else
                resolve(JSON.parse(body).data.confirmations > 1);
        });
    })
}
