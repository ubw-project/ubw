# Additional Information

## Price APIs

* Bitcoin - uses Coinbase at `https://api.coinbase.com/v2/prices/spot?currency=USD`. Sample function - 

  * ```javascript
    getPrice = function() {
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
    ```

* Ether - uses Poloniex at `https://poloniex.com/public?command=returnTicker`. Sample function - 

  * ```javascript
    getPrice = function() {
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
    ```



## Bitcoin Mining Fee

* The bitcoin mining fee is collected from shapeshift's service at `https://shapeshift.io/btcfee`. Sample function - 

* ```javascript
  getBTCFee = function() {
      return new Promise((resolve, reject) => {
          request('https://shapeshift.io/btcfee', (err, res, body) => {
              if(res.statusCode == 200)
                  resolve(Number(JSON.parse(body).recommendedFeeInSatoshi_btc));
              else
                  reject(err);
          });
      })
  }
  ```