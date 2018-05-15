# Smart Contract Library



## Process Flow

In processes, there are three primary operations - 

1. Create User
   1. In this operation, perform initialization (run `setTxLogger`,`init`, open `geth` and so on), and call `goldBank.createUser`. 
   2. Example: `goldBank.createUser("test","test","test").then(console.log)`. Conventionally all three fields are the user's ETH address.
2. Mint and Burn
   1. In order to mint and burn, simply call the `mintNewDNC` and `burn` functions.
3. getBalance
   1. For getBalance, call the function using a Promise to return the user's DNC Balance. Returned balance divided by 10 is the number of DNC the user has.

## Location

The library is located in the single file in `<project root>/blockchain/contracts/goldBank.js`. You can load this file and use as per information in this document. Consider `<project root>/blockchain/eth.js` for a guide on how this library is used.

## Setup

The library is self-contained, and can function once the following variables are set - 

* contracts.goldBankAddress
  * Address of the contract if it exists. If not, create using the `create` function and set in the config json.
* blockchain.eth.AdminAddress
  * Administrator address for posting transactions.
* blockchain.eth.AdminPassword
  * Administrator password for unlock.
* contracts.transactionGas
  * Amount of gas to post for transactions with the contract. Default: `4000000`.
* contracts.creationGas
  * Amount of gas to post for creating the contract. Default: `4000000`.

The config variables are maintained in a `config.json` file loaded by the config module in NodeJS.



All functions return Promises that must be handled. (Unhandled promises are soon to be deprecated in Javascript.)

Extended setup - run a local ethereum geth node with rpc exposed on http://localhost:8545 (default). Initialise a web3 instance on the same address, and pass it to the init function after loading this module. You can run a private testnet with the command - 
```bash
geth --dev --rpc --rpcport 8545 --fast --rpcapi "web3,eth,personal,miner" 1024 console
```

## DNC Contract (Functions)

### 1. setTxLogger

Usage: 

```javascript
goldBank.setTxLogger(txLogger);
```

The txLogger logs in the transaction to the pending tx database. Disable using a logger (`console.log`) or otherwise if you're not using it. The txLogger being used will have the following format - 

```javascript
txLogger(txAddress, funcName, contractAddress, targetAddress, txParams);
```



### 2. Init

Usage:

```javascript
goldBank.init(web3);
```

The init function must be called to initialize the module, along with a reference to a functioning `web3` module from the ethereum web3 module.



### 3. createUser

Usage:

```javascript
goldBank.createUser(email, username, meta);
```

All inputs are string fields.



### 4. getBalance

Usage:

```javascript
goldBank.getBalance(address);
```

The address is a registered Ethereum address. The promise will return the current user balance.



### 5. ifExists

Usage:

```javascript
goldBank.ifExists(address);
```

Returns `true` or `false` depending on whether the user exists.



### 6. ifVerified

Usage:

```javascript
goldBank.ifVerified(address);
```

Returns `true` or `false` depending on whether the user is verified.



### 7. mintNewDNC

Usage:

```javascript
goldBank.mintNewDNC(address, quantity);
```

Accepts address in string form, quantity in `BigInt`. The promise returns success is transaction is posted to the blockchain.



### 8. transfer

Usage:

```javascript
goldBank.transfer(sender, recipient, quantity);
```

Transfer DNC. Sender and Recipient fields are addresses.



### 9. burn

Usage:

```javascript
goldBank.burn(address, quantity);
```

Same as mint, this will burn the specified amount for the user account.