var config = require('config');

var contractABI = [{"constant":true,"inputs":[{"name":"user","type":"address"},{"name":"instrument","type":"string"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"recipient","type":"address"},{"name":"instrument","type":"string"},{"name":"quantity","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"user","type":"address"},{"name":"instrument","type":"string"},{"name":"quantity","type":"uint256"}],"name":"mintNewGSC","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newAddr","type":"address"}],"name":"createUnverifiedUser","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newAddr","type":"address"},{"name":"username","type":"string"},{"name":"metaData","type":"string"}],"name":"createUser","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"}],"name":"getUserInfo","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"denomination","type":"string"},{"name":"metaData","type":"string"}],"name":"createNewInstrument","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"}],"name":"ifVerified","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"userAddr","type":"address"},{"name":"username","type":"string"},{"name":"metaData","type":"string"}],"name":"verifyUser","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"denomination","type":"string"}],"name":"ifInstrumentExists","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newAdminAddr","type":"address"}],"name":"changeAdmin","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"denomination","type":"string"}],"name":"getInstrumentInfo","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"users","outputs":[{"name":"username","type":"string"},{"name":"metaData","type":"string"},{"name":"verified","type":"bool"},{"name":"initialized","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"user","type":"address"},{"name":"instrument","type":"string"},{"name":"quantity","type":"uint256"}],"name":"burn","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"}],"name":"ifExists","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"username","type":"string"},{"indexed":false,"name":"metaData","type":"string"}],"name":"CreatedUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"}],"name":"CreatedUnverifiedUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"username","type":"string"},{"indexed":false,"name":"metaData","type":"string"}],"name":"VerifiedUser","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"instrument","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"instrument","type":"string"},{"indexed":false,"name":"recipient","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"instrument","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"BurnRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"instrument","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"BurnCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"instrument","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burned","type":"event"}];
var contractData = String('0x6060604052341561000c57fe5b5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b6124d58061005f6000396000f300606060405236156100d9576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680631dd7cecf146100db5780632e0274a214610168578063439c529a1461022157806348725fd8146102bb5780634ceb48fd146103095780636386c1c7146103dd5780636cf787ed1461051f5780636d42eee2146105d457806378c188c51461062257806384eee8f1146106f65780638f283970146107685780639b7afeed146107b6578063a87430ba14610897578063c45b71de14610a02578063f93edb9e14610a9c575bfe5b34156100e357fe5b610152600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050610aea565b6040518082815260200191505060405180910390f35b341561017057fe5b610207600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091908035906020019091905050610bb7565b604051808215151515815260200191505060405180910390f35b341561022957fe5b6102a1600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091908035906020019091905050610f8d565b604051808215151515815260200191505060405180910390f35b34156102c357fe5b6102ef600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506111a3565b604051808215151515815260200191505060405180910390f35b341561031157fe5b6103c3600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061131a565b604051808215151515815260200191505060405180910390f35b34156103e557fe5b610411600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506115b7565b6040518080602001806020018415151515815260200183810383528681815181526020019150805190602001908083836000831461046e575b80518252602083111561046e5760208201915060208101905060208303925061044a565b505050905090810190601f16801561049a5780820380516001836020036101000a031916815260200191505b508381038252858181518152602001915080519060200190808383600083146104e2575b8051825260208311156104e2576020820191506020810190506020830392506104be565b505050905090810190601f16801561050e5780820380516001836020036101000a031916815260200191505b509550505050505060405180910390f35b341561052757fe5b6105ba600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061186f565b604051808215151515815260200191505060405180910390f35b34156105dc57fe5b610608600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506119f1565b604051808215151515815260200191505060405180910390f35b341561062a57fe5b6106dc600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050611a5c565b604051808215151515815260200191505060405180910390f35b34156106fe57fe5b61074e600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050611d77565b604051808215151515815260200191505060405180910390f35b341561077057fe5b61079c600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050611dfb565b604051808215151515815260200191505060405180910390f35b34156107be57fe5b61080e600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091905050611e9c565b604051808060200182810382528381815181526020019150805190602001908083836000831461085d575b80518252602083111561085d57602082019150602081019050602083039250610839565b505050905090810190601f1680156108895780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561089f57fe5b6108cb600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050611ffe565b604051808060200180602001851515151581526020018415151515815260200183810383528781815460018160011615610100020316600290048152602001915080546001816001161561010002031660029004801561096c5780601f106109415761010080835404028352916020019161096c565b820191906000526020600020905b81548152906001019060200180831161094f57829003601f168201915b50508381038252868181546001816001161561010002031660029004815260200191508054600181600116156101000203166002900480156109ef5780601f106109c4576101008083540402835291602001916109ef565b820191906000526020600020905b8154815290600101906020018083116109d257829003601f168201915b5050965050505050505060405180910390f35b3415610a0a57fe5b610a82600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091908035906020019091905050612046565b604051808215151515815260200191505060405180910390f35b3415610aa457fe5b610ad0600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050612316565b604051808215151515815260200191505060405180910390f35b6000610af582611d77565b1515610b045760009050610bb1565b600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001826040518082805190602001908083835b60208310610b7a5780518252602082019150602081019050602083039250610b57565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390205490505b92915050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415610f8457610c18856119f1565b1515610c275760009050610f83565b610c3083611d77565b1515610c3f5760009050610f83565b81600360008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001846040518082805190602001908083835b60208310610cb65780518252602082019150602081019050602083039250610c93565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020541015610cf95760009050610f83565b610d0284612316565b1515610d1357610d11846111a3565b505b81600360008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001846040518082805190602001908083835b60208310610d8a5780518252602082019150602081019050602083039250610d67565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390206000828254039250508190555081600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001846040518082805190602001908083835b60208310610e415780518252602082019150602081019050602083039250610e1e565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020600082825401925050819055508473ffffffffffffffffffffffffffffffffffffffff167f7a8fe3491bfb709fe7a49ba5220e002bb8d0bbd13af7e0fa32bef461edd79a6484868560405180806020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001828103825285818151815260200191508051906020019080838360008314610f43575b805182526020831115610f4357602082019150602081019050602083039250610f1f565b505050905090810190601f168015610f6f5780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a2600190505b5b5b949350505050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561119b57610fee84612316565b1515610ffd576000905061119a565b61100683611d77565b1515611015576000905061119a565b81600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001846040518082805190602001908083835b6020831061108c5780518252602082019150602081019050602083039250611069565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020600082825401925050819055508373ffffffffffffffffffffffffffffffffffffffff167ffd4bdef056842e4615d2a093647094c0b9bf67c63662d614d63fefd617e0add28484604051808060200183815260200182810382528481815181526020019150805190602001908083836000831461115b575b80518252602083111561115b57602082019150602081019050602083039250611137565b505050905090810190601f1680156111875780820380516001836020036101000a031916815260200191505b50935050505060405180910390a2600190505b5b5b9392505050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156113145761120482612316565b156112125760009050611313565b6001600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160016101000a81548160ff0219169083151502179055506000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff167f530a5f323e127769d688ad6ca826e310dc00c55412ec6c9a436946013428021c60405180905060405180910390a2600190505b5b5b919050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156115af5761137b84612316565b1561138957600090506115ae565b60806040519081016040528084815260200183815260200160011515815260200160011515815250600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082015181600001908051906020019061140c929190612370565b506020820151816001019080519060200190611429929190612370565b5060408201518160020160006101000a81548160ff02191690831515021790555060608201518160020160016101000a81548160ff0219169083151502179055509050508373ffffffffffffffffffffffffffffffffffffffff167ffc30328c5f25cc712e3d35ad22780db665c2bb3f7a1d56dd5d195f4103c9ca0b84846040518080602001806020018381038352858181518152602001915080519060200190808383600083146114fa575b8051825260208311156114fa576020820191506020810190506020830392506114d6565b505050905090810190601f1680156115265780820380516001836020036101000a031916815260200191505b5083810382528481815181526020019150805190602001908083836000831461156e575b80518252602083111561156e5760208201915060208101905060208303925061154a565b505050905090810190601f16801561159a5780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a2600190505b5b5b9392505050565b6115bf6123f0565b6115c76123f0565b60006115d284612316565b1515611655576000604060405190810160405280600581526020017f66616c736500000000000000000000000000000000000000000000000000000081525090604060405190810160405280600581526020017f66616c736500000000000000000000000000000000000000000000000000000081525090925092509250611868565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160009054906101000a900460ff16828054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156117be5780601f10611793576101008083540402835291602001916117be565b820191906000526020600020905b8154815290600101906020018083116117a157829003601f168201915b50505050509250818054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561185a5780601f1061182f5761010080835404028352916020019161185a565b820191906000526020600020905b81548152906001019060200180831161183d57829003601f168201915b505050505091509250925092505b9193909250565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156119ea576118d083611d77565b156118de57600090506119e9565b816002846040518082805190602001908083835b6020831061191557805182526020820191506020810190506020830392506118f2565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020600001908051906020019061195e929190612404565b5060016002846040518082805190602001908083835b602083106119975780518252602082019150602081019050602083039250611974565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902060010160006101000a81548160ff021916908315150217905550600190505b5b5b92915050565b60006119fc82612316565b8015611a545750600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160009054906101000a900460ff165b90505b919050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415611d6f57611abd84612316565b8015611b165750600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160009054906101000a900460ff16155b15611d69576001600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160006101000a81548160ff02191690831515021790555082600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000019080519060200190611bcc929190612404565b5081600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001019080519060200190611c23929190612404565b508373ffffffffffffffffffffffffffffffffffffffff167f5e94ea0b09d8008f36159078964948ee03c592796297bae00c2be459e9b0cb068484604051808060200180602001838103835285818151815260200191508051906020019080838360008314611cb1575b805182526020831115611cb157602082019150602081019050602083039250611c8d565b505050905090810190601f168015611cdd5780820380516001836020036101000a031916815260200191505b50838103825284818151815260200191508051906020019080838360008314611d25575b805182526020831115611d2557602082019150602081019050602083039250611d01565b505050905090810190601f168015611d515780820380516001836020036101000a031916815260200191505b5094505050505060405180910390a260019050611d6e565b600090505b5b5b9392505050565b60006002826040518082805190602001908083835b60208310611daf5780518252602082019150602081019050602083039250611d8c565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902060010160009054906101000a900460ff1690505b919050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415611e965781600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b5b5b919050565b611ea46123f0565b611ead82611d77565b1515611ef157604060405190810160405280600e81526020017f446f6573206e6f742065786973740000000000000000000000000000000000008152509050611ff9565b6002826040518082805190602001908083835b60208310611f275780518252602082019150602081019050602083039250611f04565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390206000018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015611ff15780601f10611fc657610100808354040283529160200191611ff1565b820191906000526020600020905b815481529060010190602001808311611fd457829003601f168201915b505050505090505b919050565b6001602052806000526040600020600091509050806000019080600101908060020160009054906101000a900460ff16908060020160019054906101000a900460ff16905084565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561230e576120a7846119f1565b15156120b6576000905061230d565b6120bf83611d77565b15156120ce576000905061230d565b81600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001846040518082805190602001908083835b602083106121455780518252602082019150602081019050602083039250612122565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020541015612188576000905061230d565b81600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001846040518082805190602001908083835b602083106121ff57805182526020820191506020810190506020830392506121dc565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020600082825403925050819055508373ffffffffffffffffffffffffffffffffffffffff167f809ecc34526dde62cd18e078ca7a02a7affc5ae617f80e8ddb1acb83c11ffe97848460405180806020018381526020018281038252848181518152602001915080519060200190808383600083146122ce575b8051825260208311156122ce576020820191506020810190506020830392506122aa565b505050905090810190601f1680156122fa5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a2600190505b5b5b9392505050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160019054906101000a900460ff1690505b919050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106123b157805160ff19168380011785556123df565b828001600101855582156123df579182015b828111156123de5782518255916020019190600101906123c3565b5b5090506123ec9190612484565b5090565b602060405190810160405280600081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061244557805160ff1916838001178555612473565b82800160010185558215612473579182015b82811115612472578251825591602001919060010190612457565b5b5090506124809190612484565b5090565b6124a691905b808211156124a257600081600090555060010161248a565b5090565b905600a165627a7a7230582058c22ad31f6c2af656b7cae4c7fe03515e54b9b159dc7faa07ae925499a5f4bc0029');

var adminTxParams = { from:config.get('blockchain.eth.adminAddress'), gas:config.get('contracts.transactionGas') };

var gscInstruments = config.contracts.instruments;

exports.setTxLogger = function(txLogger) {
	exports.postPendingTx = function(txAddress, funcName, contractAddress, targetAddress, txParams) {
		// console.log("Posting pending transaction -  ",txAddress,", contract address ",contractAddress," target address ",targetAddress," for function ",funcName," with parameters ",txParams);		
		txLogger(txAddress, funcName, contractAddress, targetAddress, txParams);
	}
}

exports.init = function(web3) {
	exports.web3 = web3;
	exports.contract = exports.web3.eth.contract(contractABI);
	//create the contract if we have the address
	if(config.has('contracts.GSCBankAddress') && config.get('contracts.GSCBankAddress').length) {
		exports.instance = exports.contract.at(config.get('contracts.GSCBankAddress'));
	}
}

exports.unlockAdmin = function() {
	return exports.web3.personal.unlockAccount(config.blockchain.eth.adminAddress, config.blockchain.eth.adminPassword, 1000);
}

exports.create = function() {
	console.log("Creating gscbank...");
	return new Promise(function (resolve, reject) {
		if(!unlockAdmin()) {
			reject("unlockFailed");
			return;
		}
		var goldbank = exports.contract.new(
		   {
		     from: config.get('blockchain.eth.adminAddress'), 
		     data: contractData, 
		     gas: config.get('contracts.creationGas')
		   }, function(err, contract){
				if(!err) {
			       if(!contract.address) {
			       		console.log("GSCBank creation transaction posted - ",contract.transactionHash);
			       } else {
						console.log('GSCBank contract mined. Save this address - address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
						exports.instance = exports.contract.at(contract.address);
						gscInstruments.forEach(instrument => 
							setTimeout(()=>exports.createNewInstrument(instrument[0],instrument[1]), 5000));
						
						resolve(contract.address);
			       }
			    } else {
			    	console.log("GSCBank creation failed with error ",err);
			    	reject(err);
			    }
			});
	});
}

//constant returns
exports.getBalance = function(address, instrument) {
	return new Promise(function (resolve, reject) {
		exports.instance.getBalance(address, instrument, (err,val) => {
			if(!err) resolve(val);
			else reject(err);
		});
	});
}

exports.getUserInfo = function(address) {
	return new Promise((resolve, reject) => {
		exports.instance.getUserInfo(address, (err, val) => {
			if(!err) resolve(val);
			else reject(err);
		});
	});
}

exports.ifExists = function(address) {
	return new Promise((resolve, reject) => {
		exports.instance.ifExists(address, (err, val) => {
			if(!err) resolve(val);
			else reject(err);
		});
	});
}

exports.ifVerified = function(address) {
	return new Promise((resolve, reject) => {
		exports.instance.ifVerified(address, (err, val) => {
			if(!err) resolve(val);
			else reject(err);
		});
	});	
}

exports.ifInstrumentExists = function(instrument) {
	return new Promise((resolve, reject) => {
		exports.instance.ifInstrumentExists(instrument, (err, val) => {
			if(!err) resolve(val);
			else reject(err);
		});
	});
}

//Non-constant returns
exports.createUser = function(address, username, meta) {
	return new Promise((resolve, reject) => {
		if(!unlockAdmin())
			reject("unlockFailed");
		else
			exports.instance.createUser.sendTransaction(address, username, meta, adminTxParams, (err, txAddress) => {
				if(!err) {
					console.log("Posted user create transaction to GSCBank at address - ",exports.instance.address);
					exports.postPendingTx(txAddress, "createUser", exports.instance.address, address, {address: address, username:username, meta:meta});
					resolve(txAddress);
				}
				else reject(err);
			});
	});
}

exports.createNewInstrument = function(instrument, meta) {
	return new Promise((resolve, reject) => {
		if(!unlockAdmin()) {
			reject("unlockFailed");
			return;
		}
		exports.instance.createNewInstrument.sendTransaction(instrument, meta, adminTxParams, (err, txAddress) => {
			if(!err)	resolve(txAddress);
			else		reject(err);
		});
	});
}

exports.mintNewGSC = function(address, instrument, quantity) {
	return new Promise((resolve, reject) => {
		if(!unlockAdmin())
			reject("unlockFailed");
		else
			exports.instance.mintNewGSC.sendTransaction(address, instrument, quantity, adminTxParams, (err, txAddress) => {
				if(!err) {
					exports.postPendingTx(txAddress, "mintNewGSC", exports.instance.address, address, {address: address, instrument:instrument, quantity:quantity});
					resolve(txAddress);
				}
				else reject(err);
			});
	});
}

exports.burn = function(address, instrument, quantity) {
	return new Promise((resolve, reject) => {
		if(!unlockAdmin())
			reject("unlockFailed");
		else
			exports.instance.burn.sendTransaction(address, instrument, quantity, adminTxParams, (err, txAddress) => {
				if(!err) {
					exports.postPendingTx(txAddress, "burn", exports.instance.address, address, {address: address, instrument:instrument, quantity:quantity});
					resolve(txAddress);
				}
				else reject(err);
			});
	});
}

exports.transfer = function(sender, recipient, instrument, quantity) {
	return new Promise((resolve, reject) => {
		if(!unlockAdmin())
			reject("unlockFailed");
		else
			exports.instance.transfer.sendTransaction(sender, recipient, instrument, quantity, adminTxParams, (err, txAddress) => {
				if(!err) {
					exports.postPendingTx(txAddress, "transfer", exports.instance.address, sender, {sender:sender, recipient:recipient, instrument:instrument, quantity:quantity});
					resolve(txAddress);
				}
				else reject(err);
			});
	});
}