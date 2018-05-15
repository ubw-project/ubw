var should = require('should');
var request = require("supertest");

var config = require('config');

var http_url = "http://localhost";
var url = "https://localhost";

//So that our self-signed cert is okay
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

var app = require('../app.js');
var agent = request.agent(app.instance);

// REQUIRES:
// 1. the testuser in the db (With some eth balance)
// 2. THe following SQL Query be run - DELETE FROM users WHERE email = 'dinar@dirham.com';

//TODO: Add GAS and TXFee counting mechanism as you clear up costs
//TODO: Silver instrument names are spelled wrong, correct

var existingUser = config.testuser;
existingUser.dob = "13/02/1994";

var testUser = {
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
};

var testuser_auth;
var euser_auth = '6a0f65a74abc731dd77e6041a09130f0571fd150500fcf392b29d374ba5de494a25d94913ebfefa0661a69c6d0374d36adfaa6f849b67f5e6522e570ea3e3e49942eca22ed1754a90eca42f286ad47cee983519bd6ee9e31ecbe9f44d08329f671e6b8747785f90c836b016250dde1746e32e54b3a1d46f8e64ff4ee682ea575c498a4bd7099b6ce87b6ef802045265df5d37b0d5c185230b8e50e76';

var headers = {
    'User-Agent': 'request'
  };

setTimeout(function() {

	describe("User Operations", function() {
		this.retries(3);
		it("Create Duplicate User", function(done) {
			agent
				.post('/api/v1/userops/create_new_user')
				.set(headers)
				.send(existingUser)
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.not.ok;
					body.message.should.be.equal("userExists");
					done();
				});
		});

		it("Create New User - Valid", function(done) {
			this.timeout(20000);
			agent
				.post('/api/v1/userops/create_new_user')
				.send(testUser)
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.ok;
					body.message.should.be.equal("userRegistered");
					done();
				});
		});

		it("Create New User - Malformed", function(done) {
			agent
				.post('/api/v1/userops/create_new_user')
				.send({})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.not.ok;
					body.message.should.equal("invalidRequest");
					done();
				});
		});

		it("Create Duplicate User", function(done) {
			agent
				.post('/api/v1/userops/create_new_user')
				.set(headers)
				.send(existingUser)
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.equal(false);
					body.message.should.equal("userExists");
					done();
				});
		});

		it("Authenticate User - invalidEmail", function(done) {
			agent
				.post('/api/v1/userops/login')
				.set(headers)
				.send({
						email: existingUser.email+',',
						password: existingUser.password
					})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.equal(false);
					body.msg.should.equal("invalidEmail");
					done();
				});
		});

		it("Authenticate User - incorrectPassword", function(done) {
			agent
				.post('/api/v1/userops/login')
				.set(headers)
				.send({
						email: existingUser.email,
						password: existingUser.password+'.'
					})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.equal(false);
					body.msg.should.equal("incorrectPassword");
					done();
				});
		});

		it("Authenticate User - Valid", function(done) {
			agent
				.post('/api/v1/userops/login')
				.set(headers)
				.send({
					email: existingUser.email,
					password: existingUser.password
					})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.ok;
					console.log("Token - ",body.body);
					body.body.should.be.ok;
					(body.msg == null).should.be.true;
					done();
				});
		});

		it("Add Private BTC Address - Valid", function(done) {
			agent
				.post('/api/v1/userops/add_btc_address')
				.set(headers)
				.send({authToken: euser_auth, address: "mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR"})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					console.log("Body - ", body);
					body.success.should.be.ok;
					body.msg.should.be.equal("addedAddress");
					done();
				})
		})

		it("Add Private ETH Address - Valid", function(done) {
			agent
				.post('/api/v1/userops/add_eth_address')
				.set(headers)
				.send({authToken: euser_auth, address: "0xBafbafbafbaf"})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.ok;
					body.msg.should.be.equal("addedAddress");
					done();
				})
		})

		it("Get User Data - Malformed", function(done) {
			agent
				.post('/api/v1/userops/get_user_data')
				.set(headers)
				.send({authToke:euser_auth+"."})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					should(body.success).not.ok;
					(body.body == null).should.be.true;
					done();
				})
		});

		it("Get User Data - Invalid Token", function(done) {
			agent
				.post('/api/v1/userops/get_user_data')
				.set(headers)
				.send({authToken:euser_auth+"."})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					should(body.success).not.ok;
					(body.body == null).should.be.true;
					done();
				})
		});


		it("Get User Data - Valid Token", function(done) {
			agent
				.post('/api/v1/userops/get_user_data')
				.set(headers)
				.send({authToken:euser_auth})
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.success.should.be.ok;
					should(body.body.BTCAddress).should.be.ok;
					should(body.body.ETHAddress).should.be.ok;
					done();				
				});
		});
	});

	describe("Capital Operations", function() {
		describe("Buy DNC", function() {
			it("Buy DNC  - Malformed", function(done) {
				agent
					.post('/api/v1/walletops/buy_DNC')
					.set(headers)
					.send({authToken: euser_auth, fromCurrency:'ETH'})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidRequest");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Buy DNC  - invalid Authtoken", function(done) {
				agent
					.post('/api/v1/walletops/buy_DNC')
					.set(headers)
					.send({authToken: euser_auth+'.', fromCurrency:'ETH', amount:0.1})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidAuthToken");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Buy DNC  - invalid Currency", function(done) {
				agent
					.post('/api/v1/walletops/buy_DNC')
					.set(headers)
					.send({authToken: euser_auth, fromCurrency:'WHAT', amount:0.1})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidCurrency");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Buy DNC ETH - Valid", function(done) {
				this.timeout(20000);
				agent
					.post('/api/v1/walletops/buy_DNC')
					.set(headers)
					.send({authToken: euser_auth, fromCurrency:'ETH', amount:20})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						console.log("Buy DNC ETH Hash - ", body.body);
						(body.message == null).should.be.true;
						body.body.should.be.ok;
						done();
					})
			});

			it("Buy DNC BTC - Valid", function(done) {
				this.timeout(20000);
				agent
					.post('/api/v1/walletops/buy_DNC')
					.set(headers)
					.send({authToken: euser_auth, fromCurrency:'BTC', amount:2})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						(body.message == null).should.be.true;
						body.body.should.be.ok;
						console.log("Buy DNC BTC Hash - ", body.body);
						done();
					})
			});
		});

		describe("Sell DNC", function() {
			it("Sell DNC  - invalid Authtoken", function(done) {
				agent
					.post('/api/v1/walletops/sell_DNC')
					.set(headers)
					.send({authToken: euser_auth+'.', toCurrency:'ETH', amount:0.1})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidAuthToken");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Sell DNC  - invalid Currency", function(done) {
				agent
					.post('/api/v1/walletops/sell_DNC')
					.set(headers)
					.send({authToken: euser_auth, toCurrency:'WHAT', amount:0.1})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidCurrency");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Sell DNC ETH - Valid", function(done) {
				this.timeout(20000);
				agent
					.post('/api/v1/walletops/sell_DNC')
					.set(headers)
					.send({authToken: euser_auth, toCurrency:'ETH', amount:20})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						console.log("Sell DNC ETH Hash - ", body.body);
						(body.message == null).should.be.true;
						body.body.should.be.ok;
						done();
					})
			});

			it("Sell DNC BTC - Valid", function(done) {
				this.timeout(20000);
				agent
					.post('/api/v1/walletops/sell_DNC')
					.set(headers)
					.send({authToken: euser_auth, toCurrency:'BTC', amount:2})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						(body.message == null).should.be.true;
						body.body.should.be.ok;
						console.log("Sell DNC BTC Hash - ", body.body);
						done();
					})
			});
		});

		describe("transfer BTC", function() {
			it("Transfer BTC - invalidAuthToken", function(done) {
				agent
					.post('/api/v1/walletops/send_BTC')
					.set(headers)
					.send({authToken: "what", amount:0.000001})
					.expect(200)
					.end(function(err, res) {
						console.log("received ", res.text);
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidAuthToken");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Transfer BTC - insufficientFunds", function(done) {
				agent
					.post('/api/v1/walletops/send_BTC')
					.set(headers)
					.send({authToken: euser_auth, to: config.blockchain.btc.sendAddress, amount:100000})
					.expect(200)
					.end(function(err, res) {
						console.log("received ", res.text);
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("insufficientFunds");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Transfer BTC - Valid", function(done) {
				agent
					.post('/api/v1/walletops/send_BTC')
					.set(headers)
					.send({authToken: euser_auth, to: config.blockchain.btc.receiveAddress, amount:0.0001})
					.expect(200)
					.end(function(err, res) {
						console.log("received ", res.text);
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						(body.message == null).should.be.true;
						body.body.should.be.ok;
						console.log("BTC Transfer hash - ",body.body)
						done();
					});
			});
		});

		describe("transfer ETH", function() {
			it("Transfer ETH - invalidAuthToken", function(done) {
				agent
					.post('/api/v1/walletops/send_ETH')
					.set(headers)
					.send({authToken: "what"})
					.expect(200)
					.end(function(err, res) {
						console.log("received ", res.text);
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidAuthToken");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Transfer ETH - insufficientFunds", function(done) {
				agent
					.post('/api/v1/walletops/send_ETH')
					.set(headers)
					.send({authToken: euser_auth, to: config.blockchain.eth.adminAddress, amount: 10000000})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("insufficientFunds");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Transfer ETH - Valid", function(done) {
				agent
					.post('/api/v1/walletops/send_ETH')
					.set(headers)
					.send({authToken: euser_auth, to: config.blockchain.eth.adminAddress, amount: 10})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						(body.message == null).should.be.true;
						console.log("Send ETH hash - ",body.body);
						body.body.should.be.ok;
						done();
					});
			})
		});

		describe("transfer DNC", function() {
			it("Transfer DNC - invalidAuthToken", function(done) {
				agent
					.post('/api/v1/walletops/send_DNC')
					.set(headers)
					.send({authToken: "what"})
					.expect(200)
					.end(function(err, res) {
						console.log("received ", res.text);
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("invalidAuthToken");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Transfer DNC - insufficientFunds", function(done) {
				agent
					.post('/api/v1/walletops/send_DNC')
					.set(headers)
					.send({authToken: euser_auth, toAddress: config.blockchain.eth.adminAddress, amount: 10000000})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.not.ok;
						body.message.should.be.equal("insufficientFunds");
						(body.body == null).should.be.true;
						done();
					});
			});

			it("Transfer DNC - Valid", function(done) {
				agent
					.post('/api/v1/walletops/send_DNC')
					.set(headers)
					.send({authToken: euser_auth, toAddress: config.blockchain.eth.adminAddress, amount: 1})
					.expect(200)
					.end(function(err, res) {
						body = JSON.parse(res.text);
						body.success.should.be.ok;
						(body.message == null).should.be.true;
						console.log("Send ETH hash - ",body.body);
						body.body.should.be.ok;
						done();
					});
			})
		});
	});

	describe("Static", function() {
		it("Testing Server", function(done) {
			agent
				.post('/')
				.expect(200)
				.end(function(err, res) {
					done();
				})
		});


		step("Prices", function(done) {
			agent
				.post('/api/v1/util/get_prices')
				.expect(200)
				.end(function(err, res) {
					body = JSON.parse(res.text);
					body.should.have.properties(['BTC','ETH','DNC','GOLD_1G','GOLD_100G','GOLD_1KG','SILVER100Oz','SILVER1KG']);
					body.BTC.should.be.a.number;
					body.ETH.should.be.a.number;
					body.DNC.ask.should.be.a.number;
					body.DNC.bid.should.be.a.number;
					body.GOLD_1G.ask.should.be.a.number;
					body.GOLD_1G.bid.should.be.a.number;
					done();				
				});
		})

		it("Test Endpoint", function(done) {
			agent.get('/').expect(200).end((err,res)=>done());
		})
		 
		// step("HTTP Up and running", function(done) {
		// 	request(http_url, (err, res, body) => {
		// 		res.statusCode.should.equal(200);
		// 		body.should.equal("DinarDirham Main API.");
		// 		done();
		// 	});
		// });

		// step("HTTPS Up and running", function(done) {
		// 	request(url, (err, res, body) => {
		// 		res.statusCode.should.equal(200);
		// 		body.should.equal("DinarDirham Main API.");
		// 		done();
		// 	});
		// });
	});

	describe("Contract Modules Direct", function() {
		this.timeout(600000);
		describe("GoldBank",function() {
			var goldBank = app.db.getETH().getGoldBank();
			var goldBankAddress = goldBank.instance.address;

			it("Create GoldBank", function(done) {
				goldBank.create().then(address => {
					(address != goldBankAddress).should.be.true;
					goldBank.instance.address = goldBankAddress;
					done();
				}, err => {
					console.log("Error creating goldBank - ",err);
					should(true).should.be.not.ok;
					done();
				});
			});

			it("User Exists Check - true", function(done) {
				goldBank.ifExists("0x81bd72a7c1116fe84b091c1d4d5435a6639e6807").then(exists => {
					exists.should.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.be.not.ok;
					done();
				})
			});

			it("User Exists Check - false", function(done) {
				goldBank.ifExists("0x81bd72a7c1116fe84b091c1d4d5435a6639e6800").then(exists => {
					exists.should.not.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.not.be.ok;
					done();
				});
			});

			it("User Verified Check - true", function(done) {
				goldBank.ifVerified("0x81bd72a7c1116fe84b091c1d4d5435a6639e6807").then(verified => {
					verified.should.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.be.not.ok;
					done();
				})
			});

			it("User Verified Check - false", function(done) {
				goldBank.ifVerified("0x81bd72a7c1116fe84b091c1d4d5435a6639e6800").then(verified => {
					verified.should.not.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.not.be.ok;
					done();
				});
			});
		});

		describe("GSCBank",function() {
			var GSCBank = app.db.getETH().getGSCBank();
			var GSCBankAddress = GSCBank.instance.address;

			it("Create GSCBank", function(done) {
				GSCBank.create().then(address => {
					(address != GSCBankAddress).should.be.true;
					GSCBank.instance.address = GSCBankAddress;
					done();
				}, err => {
					console.log("Error creating GSCBank - ",err);
					should(true).should.be.not.ok;
					done();
				});
			});

			it("User Exists Check - true", function(done) {
				GSCBank.ifExists("0x81bd72a7c1116fe84b091c1d4d5435a6639e6807").then(exists => {
					exists.should.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.be.not.ok;
					done();
				})
			});

			it("User Exists Check - false", function(done) {
				GSCBank.ifExists("0x81bd72a7c1116fe84b091c1d4d5435a6639e6800").then(exists => {
					exists.should.not.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.not.be.ok;
					done();
				});
			});

			it("User Verified Check - true", function(done) {
				GSCBank.ifVerified("0x81bd72a7c1116fe84b091c1d4d5435a6639e6807").then(verified => {
					verified.should.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.be.not.ok;
					done();
				})
			});

			it("User Verified Check - false", function(done) {
				GSCBank.ifVerified("0x81bd72a7c1116fe84b091c1d4d5435a6639e6800").then(verified => {
					verified.should.not.be.ok;
					done();
				}, err => {
					console.log("Error checking for user - ",err);
					should(true).should.not.be.ok;
					done();
				});
			});
		});
	});

	run();

}, 5000);



console.log("Running in 5s...");