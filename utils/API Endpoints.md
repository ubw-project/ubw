# API Endpoints

## Basic Info

```javascript
//Address begins with
var host = 'https://128.199.237.167/'; //normal https and http ports
var api = 'api/';
var vers = 'v1/';
var addr = host + api + vers

//Endpoint userOperations
var endpoint = 'userops/'
```

## (*done, tests)* Create New User -

```javascript
//Register
API URL = 'api/v1/userops/create_new_user'
//POST
var data = {
    email : "dinar@dirham.com",
    dob : "13/02/1994",
    firstName : "Dinar",
    lastName : "Dirham",
    address : "Jin",
    address2 : "To",
    city : "Compton",
    state : "California",
    country : "Inglewood",
    postalCode : "310121",
    phoneNumber : "+6598519210",
    password : "Dinar88!!"
}
//RECEIVE
var data = {
    success : true/false,
    message : "userRegistered"/"userExists"
}
```

## (*done, tests)* Login

```javascript
//Login
API URL = 'api/v1/userops/login'
//POST

var data = {
    email : "dinar@dirham.com",
    password : "Dinar88!!"
}

//RECEIVE
var data = {
    success : true/false,
    body : authToken/null,
    msg : null/"invalidEmail"/"incorrectPassword",
}
```

## (*done except transactions, test*) User Data

```javascript
//Get User Data
API URL = 'rb'
//POST

var data = {
    authToken : authToken
}

//RECEIVE
var data = {
    success : true/false,
    body : {
        email : "dinar@diarham.com",
        firstName : "Dinar",
        lastName : "Dirham",
        BTCaddress :"12d01mfm3n1hf",
        ETHaddress : "158710982nfnnnmksmfk2njnfn"
        privateAccounts : {
          BTCaddress :"12d01mfm3n1hf", // "" if no account added yet
          ETHaddress : "158710982nfnnnmksmfk2njnfn" // "" if no account added yet
        },
        balances: {
          {
            "BTC":0,
            "ETH":0,
            "DNC":0,
            "GOLD_1G":0,
            "GOLD_100G":0,
            "GOLD_1KG":0,
            "SILVER100Oz":0,
            "SILVER1KG":0,
            privateAccounts : {
              "BTC":0,
              "ETH":0
            }
          }
        },
        transactions : [
          {
            txnHash: "vd87uh3t54j89werv09ji2hg4mi0bwdrfim90g42hdvscfbhrh34yrsbh",
            date: "25/11/2016" / 25415136236512546, // Not sure if date should be a string or a number. Either works for me as long as we set it as standard
            type: "Transfer" / "Mint" / "Burn" / "Deposit", // Open to better suggestions
            status: "Confirmed" / "Pending",
            amount: 133.213,
            from: "fg234mni90ve9unifg239unigvet43ynu9fwqe23t",
            to: "t13jni902egv0nie2g0jnie2rg09hnidwsvbu9"
          },
          {
            txnHash: "vd87uh3t54j89werv09ji2hg4mi0bwdrfim90g42hdvscfbhrh34yrsbh",
            date: "25/11/2016" / 25415136236512546, // Not sure if date should be a string or a number. Either works for me as long as we set it as standard
            type: "Transfer" / "Mint" / "Burn" / "Deposit", // Open to better suggestions
            status: "Confirmed" / "Pending",
            amount: 133.213,
            from: "fg234mni90ve9unifg239unigvet43ynu9fwqe23t",
            to: "t13jni902egv0nie2g0jnie2rg09hnidwsvbu9"
          },
          ...
        ]

    }/null,
    msg : null/"invalidAuthToken"
}
```

# Utilities

```javascript
//******************************************************************************//
//Endpoint Util
var endpoint = 'util/'
```

## *(not done, move to client side)* Countries

```javascript
//Get Countries List
API URL = 'api/v1/util/countries'
//GET
var data = countries
```

## *(working, mt4 returns zero for now, tests)* Prices

```javascript
//Get prices
API URL = 'api/v1/util/get_prices'
var data = {
  BTC: 123,
  ETH: 23,
  DNC: {
    bid: 213,
    ask: 214
  },
  GOLD_1G: {
    bid: 213,
    ask: 214
  },
  GOLD_100G: {
    bid: 213,
    ask: 214
  },
  GOLD_1KG: {
    bid: 213,
    ask: 214
  },
  SILVER_100Oz: {
    bid: 213,
    ask: 214
  },
  SILVER_1KG: {
    bid: 213,
    ask: 214
  }
}
```

# Wallet

```javascript
//******************************************************************************//
//Endpoint Wallet
var endpoint = 'walletops/'
```

## *(done)*  Send BTC

```javascript
//Send Bitcoin
//actual endpoint `api/v1/walletops/send_BTC
//POST
var data = {
    authToken : authToken,
    to : sendToAddress,
    amount : amountInBTC
}
//RECEIVE
var data = {
    success : true/false,
    message : null/ 'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

For this and for all buys involving bitcoin, add a `pendingTransactions` message, as we will reject bitoin transactions from an account while there are still pending Txs. 



## *(done)* Send ETH

```javascript
//Send Ether
//actual endpoint `api/v1/walletops/send_ETH
//POST
var data = {
    authToken : authToken,
    to : sendToAddress,
    amount : amountInETH //unit ETHER, not wei.
}
//RECEIVE
var data = {
    success : true/false,
    message : null/ 'invalidAuthToken' / 'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

dude, change the to field to toAddress. WTF

Also, why invalidCurrency? How is that possible?

## *(done)* Mint DNC

Cost of DNC in ETH = 

(DNC to USD: DNC bid)/(ETH to USD: ETH price)''

```javascript
//Mint DNC
//actual endpoint `b
//POST
var data = {
    authToken : authToken,
    fromCurrency : 'ETH'/'BTC',
    amount : amountInDNC
}

//RECEIVE
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## *(done for ETH, BTC done but not perfect)* Burn DNC

```javascript
//BURN DNC
//actual endpoint `/api/v1/walletops/sell_DNC
//POST
var data = {
    authToken : authToken,
    toCurrency : 'ETH'/'BTC',
    amount : amountInDNC
}

//RECEIVE
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

Changes - add option 'serverEmpty' to message if our funds run out - show some message saying server is down. Also add 'transactionFailed' - show a message saying try again - the blockchain isn't always super predictable. Also add the output 'invalidRequest' for all the requests - this is the general catch all exception. If this happens (response.message will be set to this), reload the page, or ask the user to try again, or whatever.

## *(done)* Transfer DNC

```javascript
//TRANSFER DNC
//actual endpoint `api/v1/walletops/transfer_DNC
//POST
var data = {
    authToken : authToken,
    toAddress : toAddress,
    amount : amount
}

//RECEIVE
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

Why is there an invalid currency option here? the request is for transfer_DNC.

**Important - Change this to send_DNC**.

## Buy GSC

*For GSC, add the return option 'invalidInstrument'.*

```javascript
//BUY GSC Instrument
//actual endpoint `api/v1/walletops/buy_GSC
//POST
var data = {
    authToken : authToken,
    fromCurrency: "ETH"/"DNC"/"BTC",
    instrument : "GOLD_1G"/"GOLD_100G"/"GOLD_1KG"/"SILVER_100OZ"/"SILVER1KG",
    amount : unitsOfGSC
}

//RECEIVE
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Burn GSC

```javascript
//BURN GSC Instrument
//actual endpoint `api/v1/walletops/sell_GSC
//POST
var data = {
    authToken : authToken,
    toCurrency : "ETH"/"DNC"/"BTC",
    instrument : "GOLD_1G"/"GOLD_100G"/"GOLD_1KG"/"SILVER_100OZ"/"SILVER1KG",
    amount : unitsOfGSC
}
//RECEIVE
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```
