pragma solidity 0.4.24;

import "./open-zeppelin/Ownable.sol";

contract WhiteList is Ownable {
    event WhiteListAdded(address indexed account);
    event WhiteListRemoved(address indexed account);

    mapping(address => bool) public whiteList;

    modifier onlyValidAddressAllowed(address addr) {
        require(
            addr != address(0),
            "Only valid address allowed"
        );
        _;
    }

    constructor() public {
        // owner must be always whiteListed.
        whiteList[msg.sender] = true;
    }

    function isWhiteListed(address user)
        public
        view
        returns (bool)
    {
        return whiteList[user];
    }

    function addWhiteList(address user)
        public
        onlyValidAddressAllowed(user)
        onlyOwner
    {
        require(
            whiteList[user] == false,
            "Duplicate data is not allowed."
        );
        whiteList[user] = true;
        emit WhiteListAdded(user);
    }

    function removeWhiteList(address user)
        public
        onlyValidAddressAllowed(user)
        onlyOwner
    {
        whiteList[user] = false;
        emit WhiteListRemoved(user);
    }
}
