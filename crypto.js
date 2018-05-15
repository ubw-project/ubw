var crypto = require('crypto');
var config = require('config');

exports.getSHA1ofJSON = function(input){
    return crypto.createHash('sha1').update(JSON.stringify(input)).digest('hex')
}

exports.genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

exports.sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

exports.jsonEncrypt = function(inp) {
	return exports.encrypt(JSON.stringify(inp));	
}

exports.jsonDecrypt = function(inp) {
	return new Promise(function(resolve, reject) {
		try {
			out = JSON.parse(exports.decrypt(inp));
			resolve(out);
		} catch(exception) {
			reject(Error("JSON Parsing Failed"));
		}
	});
}

exports.encrypt = function(text){
  var cipher = crypto.createCipher(config.get("crypto.algorithm"),config.get("crypto.password"));
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
 
exports.decrypt = function(text){
  var decipher = crypto.createDecipher(config.get("crypto.algorithm"),config.get("crypto.password"));
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}