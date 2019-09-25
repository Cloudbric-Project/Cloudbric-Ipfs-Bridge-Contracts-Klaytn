pragma solidity 0.4.24;

import "./open-zeppelin/Ownable.sol";
import "./open-zeppelin/SafeMath.sol";

/**
 * @title CloudbricIpfsBridgeAuth
 * @dev The CloudbricIpfsBridgeAuth contract provides authorization control
 * for accessing Cloudbric's Ipfs CIds
 */
contract CloudbricIpfsBridgeAuth is Ownable {
    using SafeMath for uint16;

    struct Limit {
        bool isWhiteListed;
        uint16 remainingLimit;
    }

    mapping (address => Limit) authTable;

    modifier onlyNewUserAllowed(address _user) {
        require(
            !authTable[_user].isWhiteListed &&
            authTable[_user].remainingLimit == 0,
            "User already exists."
        );
        _;
    }

    modifier onlyExistingUserAllowed(address _user) {
        require(
            authTable[_user].isWhiteListed,
            "User should exists in authTable"
        );
        _;
    }

    constructor() public {
        
    }

    function addAuthTable(address _user)
        public
        onlyOwner
        onlyNewUserAllowed(_user)
        returns (bool)
    {
        authTable[_user] = Limit(true, 1000);
        return true;
    }

    function getUserLimit(address _user)
        public
        view
        onlyExistingUserAllowed(_user)
        returns (uint)
    {
        return authTable[_user].remainingLimit;
    }

    function addUserLimit(address _user, uint16 _value)
        public
        onlyOwner
        onlyExistingUserAllowed(_user)
        returns (bool)
    {
        authTable[_user].remainingLimit.add(_value);
        return true;
    }

    function subUserLimit(address _user, uint16 _value)
        public
        onlyOwner
        onlyExistingUserAllowed(_user)
        returns (bool)
    {
        authTable[_user].remainingLimit.sub(_value);
        return true;
    }
}