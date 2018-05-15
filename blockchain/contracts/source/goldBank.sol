pragma solidity ^0.4.4;


/*
 * ERC20 interface
 * see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 {
  uint256 public totalSupply = 0;
  function balanceOf(address who) constant returns (uint);
  function allowance(address owner, address spender) constant returns (uint);

  // function transfer(address to, uint value) returns (bool ok);
  function transferFrom(address from, address to, uint value) returns (bool ok);
  function approve(address spender, uint value) returns (bool ok);
  event Transfer(address indexed from, address indexed to, uint value);
  event Approval(address indexed owner, address indexed spender, uint value);
}


/**
 * Math operations with safety checks
 */
contract SafeMath {
  function safeMul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function safeSub(uint a, uint b) internal returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function safeAdd(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    assert(c>=a && c>=b);
    return c;
  }

  function assert(bool assertion) internal {
    if (!assertion) throw;
  }
}


/**
 * Standard ERC20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 * Based on code by FirstBlood:
 * https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, SafeMath {

  mapping(address => uint) balances;
  mapping (address => mapping (address => uint)) allowed;

//   function transfer(address _to, uint _value) returns (bool success) {
//     balances[msg.sender] = safeSub(balances[msg.sender], _value);
//     balances[_to] = safeAdd(balances[_to], _value);
//     Transfer(msg.sender, _to, _value);
//     return true;
//   }

  function transferFrom(address _from, address _to, uint _value) returns (bool success) {
    var _allowance = allowed[_from][msg.sender];
    
    balances[_to] = safeAdd(balances[_to], _value);
    balances[_from] = safeSub(balances[_from], _value);
    allowed[_from][msg.sender] = safeSub(_allowance, _value);
    Transfer(_from, _to, _value);
    return true;
  }

  function balanceOf(address _owner) constant returns (uint balance) {
    return balances[_owner];
  }

  function approve(address _spender, uint _value) returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }

}

contract GoldBank is StandardToken{
	address admin;
	string public name = "DinarCoin";
    string public symbol = "DNC";
    uint public decimals = 1;
	
	event CreatedUser(address user, string username, string metaData);
	event CreatedUnverifiedUser(address user);
	event VerifiedUser(address user, string username, string metaData);
	event Minted(address recipient, uint value);
	// event Transfered(address from, address recipient, uint value);
	event Burned(address user, uint value);
	event BurnRequested(address user, uint value);
	event BurnCancelled(address user, uint value);

	function GoldBank(){
		admin = msg.sender;
	}
	modifier onlyadmin { if (msg.sender == admin) _; }

	// function totalSupply() constant returns (uint256 totalSupply) {
	// 	return tSupply;
	// }

	struct UserInfo{		
		string username;
		string metaData;
		bool verified;
		bool initialized;
	}

	mapping (address => UserInfo) public users;
	// mapping (address => uint) public balances; // in qDinarCoin, 1 DNC = 10000 qDNC
	mapping (address => uint) public burnRequestBalance; // in qDinarCoin, 1 DNC = 10000 qDNC

	// this is called to change the admin
	function changeAdmin(address _newAdminAddr) onlyadmin returns (bool) {
		admin = _newAdminAddr;
	}

	//************* FUNCTIONALITY RELATING TO USERs ****************//
	// this function creates and registers a new user to the contract
	// return code: 
	// - false, the address is already registered
	// - true, successfully created
	function createUser (address newAddr, string username, string metaData) onlyadmin returns (bool) 
	{
		if (ifExists(newAddr))
			return false;
		users[newAddr] = UserInfo(username, metaData, true, true);
		CreatedUser(newAddr, username, metaData);
		return true;
	}

	function getUserInfo (address userAddr) public constant returns (string, string, bool)
	{
		if (!ifExists(userAddr))
			return ("false", "false", false);
		return (users[userAddr].username, users[userAddr].metaData, users[userAddr].verified);
	}

	/** this function allows anyone to create a new user on the fly without any registration/ verification
	* with  DinarDirham
	* The registration/ verification can be done later.
	* Unverified user can only receive DNC/GSC
	*/
	function createUnverifiedUser (address _newAddr) onlyadmin returns (bool)
	{
		if (ifExists(_newAddr))
			return false;
		
		users[_newAddr].initialized = true;
		users[_newAddr].verified 	= false;
		CreatedUnverifiedUser(_newAddr);
		return true;
	}

	// this is to verify existing users
	function verifyUser(address userAddr, string username, string metaData) onlyadmin returns (bool)
	{
		if (ifExists(userAddr) && !users[userAddr].verified){
			users[userAddr].verified = true;
			users[userAddr].username = username;
			users[userAddr].metaData = metaData;
			VerifiedUser(userAddr, username, metaData);
			return true;
		}
		return false;
	}

	/*
	* Check if a user exists
	*/
	function ifExists (address userAddr) public constant returns (bool)
	{
		return users[userAddr].initialized;			
	}

	/*
	* Check if a user is verified
	*/
	function ifVerified (address userAddr) public constant returns (bool)
	{
		return (ifExists(userAddr) && users[userAddr].verified);
	}



	//************* DNC FUNCTIONALITY ****************//	
	/*
	* This is called when users mint new DNC.
	* This function is triggered by admin only
	*/
	function mintNewDNC (address user, uint quantity) onlyadmin returns (bool) 
	{
		if (!ifExists(user))
			createUser(user,"","");			
			// return false;
		balances[user] += quantity;
		totalSupply += quantity;
		Minted(user, quantity);
		return true;
	}

	// only verified users can transfer their DNC
	function transfer (address sender, address recipient, uint quantity) onlyadmin returns (bool)
	{				
		// if (!ifVerified(sender))
		// 	return false;
		if (balances[sender] < quantity)
			return false;
		if (!ifExists(recipient))
			createUser(recipient,"","");
	    
		balances[sender] = safeSub(balances[sender], quantity);
        balances[recipient] = safeAdd(balances[recipient], quantity);
    
		Transfer(sender, recipient, quantity);
		return true;
	}

	function getBalance (address user) public constant returns (uint)
	{		
		return balances[user];
	}


	function burn (address user, uint quantity) onlyadmin returns (bool) 
	{
		if (!ifVerified(user))
			return false;
		if (balances[user] < quantity)
			return false;
		balances[user] -= quantity;		
		totalSupply -= quantity;
		Burned(user, quantity);
	}

	function approve(address _spender, uint _value) returns (bool success) {
		if (!ifVerified(msg.sender))
			return false; 
	    allowed[msg.sender][_spender] = _value;
	    Approval(msg.sender, _spender, _value);
	    return true;
  	}

}
/********* END GoldBankContract ******/