# API Endpoints

## Basic Info

* Addresses begin with `https://node.universalblockchains.com/`. Host uses HSTS and can only be contacted over https. CORS has not been enabled, once all connecting APIs are identified, CORS needs to be updated.
* Given below are the API calls that can be made, along with example inputs and responses. All APIs are POST except for `get_prices`.

## Implemented APIs

* Create New User
* Login
* Get User Data
* Get User Metadata
* Modify User Data
* Get Prices
* Send BTC
* Send ETH
* Mint DNC
* Burn DNC
* Mint GSC
* Burn GSC
* Transfer DNC
* Get Transactions
* Add BTC Address
* Add ETH Address
* Admin Mint DNC
* Admin Burn DNC
* Admin Login
* Receive Password Reset Code
* Reset Password

All APIs are provided with the following information - URL, sample request, reply format.

Get Transactions is open form and can be explored at the provided URL. This will return internal pending transactions that cannot be fetched directly from the blockchain.

## Security

Security features regarding the API are - 

* CORS - enabled to restrict origins. Turned off for testing, once servers are selected, can be re-enabled.
* SSL
* Expiring One-time Token communication. Login again if the token expires.

## Create New User Account

```javascript
//Register
API URL = 'api/v1/userops/create_new_user'
//Example POST request
var data = {
    email : "dinar@dirham.com", // required
    dob : "13/02/1994",
    firstName : "Dinar", // required
    lastName : "Dirham", // required
    address : "Jin",
    address2 : "To",
    city : "Compton",
    state : "California",
    country : "Inglewood", // required
    postalCode : "310121",
    phoneNumber : "+6598519210", // required
    password : "Dinar88!!" // required
}
//Received Data
var data = {
    success : true/false,
    message : "userRegistered"/"userExists"
}
```

## Get User Metadata

```javascript
//Get User Metadata
API URL = 'api/v1/userops/get_user_metadata'
//Example POST request
var data = {
  	authToken: authToken
}
//Received Data
var data = {
    success : true/false,
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
}
```

## Modify User Account

```javascript
//Modify User Data
API URL = 'api/v1/userops/modify_user'
//Example POST request
var data = {
  	authToken: authToken
    dob : "13/02/1994",
    firstName : "Dinar", 
    lastName : "Dirham", 
    address : "Jin",
    address2 : "To",
    city : "Compton",
    state : "California",
    country : "Inglewood", 
    postalCode : "310121",
    phoneNumber : "+6598519210"
}
//Received Data
var data = {
    success : true/false,
}
```

## Login

```javascript
//Login
API URL = 'api/v1/userops/login'

//Example POST request
var data = {
    email : "dinar@dirham.com",
	// Must contain 1 capital letter, 1 number, 1 Special Character and 8 letters long 
    password : "@Example1234@" 
}

//Received Data
var data = {
    success : true/false,
    body : authToken/null, 
  	// Authtoken received is used to Authenticate user for all other transactions
  	// This authToken is time-sensitive and only works for 1 hour
    msg : null/"invalidEmail"/"incorrectPassword",
  	// If login is unsuccessful, refer to message for more information
}
```

## Get User Data

```javascript
//Get User Data
API URL = 'api/v1/userops/get_user_data'

//Example POST request
var data = {
    authToken : authToken // the authToken received when user logged in
}

//Received Data
var data = {
    success : true/false,
    body : {
        email : "dinar@diarham.com",
        firstName : "Dinar",
        lastName : "Dirham",
        BTCaddress :"12d01mfm3n1hf",
        ETHaddress : "158710982nfnnnmksmfk2njnfn",
      	KYCAML: "True"/"False",
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
        }
    }/null,
    msg : "invalidAuthToken" // No msg for successful authentication
}
```

## Get Prices

```javascript
//Get prices
API URL = 'api/v1/util/get_prices' // This is a get request. No POST Object required

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

## Send BTC

```javascript
//Send Bitcoin
API URL = 'api/v1/walletops/send_BTC' 

//Example POST Request
var data = {
    authToken : authToken,
    to : sendToAddress,
    amount : amountInBTC
}

//Received Response
var data = {
    success : true/false,
    message : null/ 'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Send ETH

```javascript
//Send Ether
API URL = 'api/v1/walletops/send_ETH'

//Example POST Request
var data = {
    authToken : authToken,
    to : sendToAddress,
    amount : amountInETH //unit ETHER, not wei.
}

//Received Response
var data = {
    success : true/false,
    message : null/ 'invalidAuthToken' / 'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Mint DNC

```javascript
//Mint DNC
API URL = 'api/v1/walletops/buy_DNC'

//Example POST Request
var data = {
    authToken : authToken,
    fromCurrency : 'ETH'/'BTC',
    amount : amountInDNC
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Burn DNC

```javascript
//BURN DNC
API URL = '/api/v1/walletops/sell_DNC'

//Example POST Request
var data = {
    authToken : authToken,
    toCurrency : 'ETH'/'BTC',
    amount : amountInDNC
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency'/'insufficientAdminFunds'/'ticket',
    ticketID: <random 10 digit string for ticket ID>
    body : txHash
}
```

## Transfer DNC

```javascript
//TRANSFER DNC
API URL = 'api/v1/walletops/send_DNC'
//Example POST Request
var data = {
    authToken : authToken,
    toAddress : toAddress,
    amount : amount
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Buy GSC

```javascript
//BUY GSC Instrument
API URL = 'api/v1/walletops/buy_GSC'

//Example POST Request
var data = {
    authToken : authToken,
    fromCurrency: "ETH"/"DNC"/"BTC",
    instrument : "GOLD_1G"/"GOLD_100G"/"GOLD_1KG"/"SILVER_100OZ"/"SILVER1KG",
    amount : unitsOfGSC
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Burn GSC

```javascript
//BURN GSC Instrument
API URL = 'api/v1/walletops/sell_GSC'
//Example POST Request
var data = {
    authToken : authToken,
    toCurrency : "ETH"/"DNC"/"BTC",
    instrument : "GOLD_1G"/"GOLD_100G"/"GOLD_1KG"/"SILVER_100OZ"/"SILVER1KG",
    amount : unitsOfGSC
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'insufficientFunds'/'invalidCurrency',
    body : txHash
}
```

## Get Transactions

```javascript
//Get User Transactions
API URL = 'api/v1/userops/get_transactions'
//Example POST Request
var data = {
  authToken : authToken
}

//Received Response
var data = {
  "BTC": "[<BTC Transactions>]",
  "ETH": "[<ETH Transactions>]",
  "DNC": "[<DNC Transactions>]",
  "GSC": "[<GSC Transactions>]",
}

//Real response example - 
{"BTC":[],"ETH":[{"id":65,"address":"0x30af31894519499b65f7f7b7ec7d9d037702870ef564e4a473894d0847dd4886","funcName":"transferETH","contractAddress":"","targetAddress":"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751","params":"{\"from\":\"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751\",\"to\":\"0x633b26841d7780921ba0566358ef143e4c972b9a\",\"quantity\":100000000000000000000}","createdAt":"2017-03-13T11:12:37.817Z","updatedAt":"2017-03-13T11:12:37.817Z"},{"id":67,"address":"0xd64e34cbcfda399e08b6741ad8d6cf3d2d3e6d0df5df2c06db734966fb6e1362","funcName":"withdrawETH","contractAddress":"","targetAddress":"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751","params":"{\"from\":\"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751\",\"to\":\"0xb1d531333252a46860f415744719c1f0f1cbfe51\",\"quantity\":59187755071918290000}","createdAt":"2017-03-13T11:13:02.158Z","updatedAt":"2017-03-13T11:13:02.158Z"},{"id":70,"address":"0xb40bf19ea6a8151e5fc8d4cad77851750c7b771d3f447c48578769f20baf5d8f","funcName":"depositETH","contractAddress":"","targetAddress":"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751","params":"{\"from\":\"0xb1d531333252a46860f415744719c1f0f1cbfe51\",\"to\":\"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751\",\"quantity\":90375716784377970000}","createdAt":"2017-03-13T11:13:30.451Z","updatedAt":"2017-03-13T11:13:30.451Z"},{"id":34,"address":"0xee345889b817049271478003bfcdd59d2328dde0e12fb9148dc9ee3dc6619f2b","funcName":"depositETH","contractAddress":"","targetAddress":"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751","params":"{\"from\":\"0xb1d531333252a46860f415744719c1f0f1cbfe51\",\"to\":\"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751\",\"quantity\":573024952285916360000}","createdAt":"2017-03-09T17:47:52.698Z","updatedAt":"2017-03-09T17:47:52.698Z"}],"DNC":[{"id":66,"address":"0x92ba069fd277af648fd3d84dffd888c2194096bd6500cc6aabd1e13917aa3843","funcName":"transfer","contractAddress":"0xb81ba8bcb1d893d94a4fd53579a3b785591c42b0","targetAddress":"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751","params":"{\"sender\":\"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751\",\"recipient\":\"0x633b26841d7780921ba0566358ef143e4c972b9a\",\"quantity\":5}","createdAt":"2017-03-13T11:12:51.199Z","updatedAt":"2017-03-13T11:12:51.199Z"},{"id":69,"address":"0x498bb3e5bdefcfd0c7aff9b14a33c058b113e582325cd618a1acb32e13f55fc9","funcName":"burn","contractAddress":"0xb81ba8bcb1d893d94a4fd53579a3b785591c42b0","targetAddress":"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751","params":"{\"address\":\"0xb880e7bb22c826af2df59a3c512f2cd2c6e5c751\",\"quantity\":12}","createdAt":"2017-03-13T11:13:26.767Z","updatedAt":"2017-03-13T11:13:26.767Z"}],"GSC":[]}
```
## Add BTC Address

```javascript
//Add BTC Address
API URL = '/api/v1/userops/add_btc_address'

//Example POST Request
var data = {
  authToken: authToken,
  address: btcAddress
}

//Received Response
var data = {
  success: true/false,
  msg: "failedToAdd/addedAddress"
}
```

## Add ETH Address

```javascript
//Add BTC Address
API URL = '/api/v1/userops/add_eth_address'

//Example POST Request
var data = {
  authToken: authToken,
  address: ethAddress
}

//Received Response
var data = {
  success: true/false,
  msg: "failedToAdd/addedAddress"
}
```



# Admin Functionality

All admin functionality requires an admin authToken to unlock. Currently the admin account is set to the email 'dd@dd.com'. Unlock the same way you would login any other account - using the default password. Pass the authToken thus received as adminAuthToken.

## Admin Mint DNC without withdrawal

This API will mint DNC on the contract without withdrawing from internal BTC/ETH accounts. Use with caution.
Requires an admin authToken that can be gotten by logging in with the admin account.

```javascript
// Admin Mint DNC
API URL = 'api/v1/admin/mint_DNC'

//Example POST Request
var data = {
    authToken : authToken,
    adminAuthToken: adminAuthToken,
    amount : amountInDNC
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'invalidAdmin'/'invalidResponse',
    body : txHash
}
```

## Admin Burn DNC without withdrawal

This API will burn DNC on the contract without depositing to internal BTC/ETH accounts. Use with caution.
Requires an admin authToken that can be gotten by logging in with the admin account.

```javascript
// Admin Burn DNC
API URL = 'api/v1/admin/burn_DNC'

//Example POST Request
var data = {
    authToken : authToken,
    adminAuthToken: adminAuthToken,
    amount : amountInDNC
}

//Received Response
var data = {
    success : true/false,
    message : null/'invalidAuthToken'/'invalidAdmin'/'invalidResponse'/'insufficientFunds',
    body : txHash
}
```

## Admin Login

Provides the ability to onboard users without password. USE WITH CAUTION - MAJOR SECURITY RISK.

```javascript
// Admin Login
API URL = 'api/v1/admin/admin_login'

//Example POST Request
var data = {
  adminAuthToken: adminAuthToken,
  email: userEmail
}

//Received Response
var data = {
  success: true/false,
  message: null/'invalidAdmin'/'invalidEmail'/'invalidResponse'
  body: user_authToken
}

## Receive Password Reset Code

(This is soon to be deprecated. Use with caution.)

```javascript
API URL = '/api/v1/userops/reset_password'

var data = {
  email: "email address"
}

var response = {
  success: true / false,
  code: "some string code to send to user email address"
  msg: "invalidEmail"
}
```

## Reset Password Update

```javascript
API URL = '/api/v1/userops/reset_password_confirm'

var data = {
  email: $scope.email,
  code: $scope.code,
  pwd: $scope.pwd
}

var data = {
  success: true / false,
  msg: "invalidEmail" / "invalidCode"
}
```