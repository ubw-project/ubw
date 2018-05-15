var config = require('config');
var request = require('request');

var fs = require('fs');



exports.getDNCPrice = function() {
	return new Promise((resolve, reject) => {
		try {
			request(config.mt4.DNCQuoteUrl, function(err, res, body) {
		            if(res.statusCode == 200) {
		            	quote = JSON.parse(body);
		                resolve({bid: quote.bid, ask: quote.ask});
		            } else {
		                reject("mt4 DNC Price Getting Failed");
		            }
		        });
		}
		catch(err) {
			console.log("Error in getDNCPrice - ",err);
			reject(err);
		}
	});
}

exports.getGSCPrice = function(instrument) {
	return Promise.resolve({ bid: 10, ask: 10});
}

exports.buyDNC = function(amount) {
	return new Promise((resolve, reject) => {
		request(config.mt4.DNCBuyUrl+amount, function(err, res, body) {
			try {
		            if(res.statusCode == 200) {
		            	if(res.body == false) {
		            		reject("mt4 server denied buy order. Responded with false");
		            	} else {
		            		console.log("MT4 buyDNC succeeded - ",JSON.parse(body));
		                	resolve(JSON.parse(body));
		            	}
		            } else {
		                reject("mt4 server did not respond to DNC buy request");
		            }
	 	       }
	 	   catch(err) {
	 	   		console.log("MT4 Error in buyDNC - ",err);
	 	   		fs.appendFile(config.logging.mt4, 'mt4 error in buyDNC - '+err+', amount - '+amount+'\n', function(err) {
	 	   			if(err) console.log("Error in logging mt4 error - ",err);
	 	   		})
	 	   		resolve(1);
	 	   		//reject(err);
	 	   }
	        });
		});
}

exports.sellDNC = function(amount) {
	return new Promise((resolve, reject) => {
		request(config.mt4.DNCSellUrl+amount, function(err, res, body) {
			try {
				if(res.statusCode == 200) {
					if(res.body == false) {
						reject("mt4 server denied sell order. Responded with false.");
					} else {
						console.log("MT4 sellDNC succeded - ",JSON.parse(body));
						resolve(JSON.parse(body));
					}
				} else {
					reject("mt4 server did not respond to DNC sell request")
				}
			} catch(err) {
				console.log("MT4 Error in sellDNC - ",err,". Logging...");
	 	   		fs.appendFile(config.logging.mt4, 'mt4 error in sellDNC - '+err+', amount - '+amount, function(err) {
	 	   			if(err) console.log("Error in logging mt4 error - ",err);
	 	   		})
				resolve(1);
				//reject(err);
			}
		});
	});
}
