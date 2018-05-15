var Sequelize = require('sequelize');

exports.models = {}

exports.initialized = false;

exports.init = function(seq) {
	exports.models.User = seq.define('user', {
		email: {
			type:Sequelize.STRING,
			unique:true
		},
		dob: Sequelize.DATE,
		firstName: Sequelize.STRING,
		lastName: Sequelize.STRING,
		address1: Sequelize.STRING,
		address2: Sequelize.STRING,
		city: Sequelize.STRING,
		state: Sequelize.STRING,
		country: Sequelize.STRING,
		postalCode: Sequelize.STRING,
		phNumber: Sequelize.STRING,
		password: Sequelize.STRING,
		salt: Sequelize.STRING,
		kyc: Sequelize.BOOLEAN,
		emailVerified: Sequelize.BOOLEAN,
		btcAddress: Sequelize.TEXT,
		btcKey: Sequelize.TEXT,
		ethAddress: Sequelize.TEXT,
		privateEthAddress: Sequelize.TEXT,
		privateBtcAddress: Sequelize.TEXT,
		ethAccountCreated: Sequelize.BOOLEAN
	});

	exports.models.Transaction = seq.define('transaction', {
		address: {
			type: Sequelize.STRING,
			unique: true },
		funcName: Sequelize.STRING,
		contractAddress: Sequelize.STRING,
		targetAddress: Sequelize.STRING,
		params: Sequelize.TEXT
	});

	exports.initialized = true;

}

exports.createModels = function(force) {
	return new Promise(function(resolve, reject) {
		if(exports.initialized == false) {
			console.log("Module not initialized.");
			reject(Error("Module not initialized."));
		}
		console.log("Creating models..");

		for(model in exports.models) {
			exports.models[model].sync({force:force}).then(function() {
				console.log("Model "+model+" created.");
			}, function(err) {
				console.log("Error in creating model "+model+".");
				reject(err);
			});
		}

		resolve("Success.");
	});	
}