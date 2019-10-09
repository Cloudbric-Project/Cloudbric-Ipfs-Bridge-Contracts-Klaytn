pragma solidity 0.4.24;

import "./open-zeppelin/Ownable.sol";
import "./WhiteList.sol";

/**
 * @title CloudbricWafBlackIpStorage
 * @dev The CloudbricIpfsBridge contract has an Ipfs CId(Contents Identifier) of
 * black ips detected by Cloudbric WAF.
 */
contract CloudbricWafBlackIpStorage is Ownable {
    /**
    * @notice This contract uses Multihash Identifier which is used by IPFS.
    */
    struct Multihash {
        bytes32 hash;
        uint8 hashFunction;
        uint8 size;
        bool isExist;
    }

    /**
    * @dev prefix "waf" means these data is collected by Cloudbric WAF.
    */
    mapping(bytes32 => Multihash) public wafBlackIpList;
    bytes32[] public wbiLookUpTable;

    WhiteList public whiteList;

    event AddWafBlackIp(address indexed from, bytes32 clbIndex, bytes32 hash, uint8 hashFunction, uint8 size);

    modifier onlyWhiteListed(address _addr) {
        require(
            whiteList.isWhiteListed(_addr),
            "Only white listed account can add data"
        );
        _;
    }

    modifier onlyUniqueClbIndexAllowed(bytes32 _clbIndex) {
        require(
            wafBlackIpList[_clbIndex].isExist == false,
            "Only unique clbIndex can be added"
        );
        _;
    }

    constructor(address whiteListContractAddress) public {
        whiteList = WhiteList(whiteListContractAddress);
    }

    /**
    * @dev get length of Ipfs CIds of black ip data which is detected by Cloudbric WAF.
    */
    function wafBlackIpListSize()
        public
        view
        returns (uint)
    {
        return wbiLookUpTable.length;
    }

    /**
    * @dev get Ipfs CId of black ip data detected by Cloudbric WAF using index.
    * @notice you should know size of lookup table.
    */
    function getWafBlackIpAtIndex(uint _index)
        public
        view
        returns (bytes32 hash, uint8 hash_function, uint8 size)
    {
        bytes32 wafBlackIpIdx = wbiLookUpTable[_index];
        require(
            _index < wbiLookUpTable.length,
            "Given index is out of bound."
        );

        Multihash storage multihash = wafBlackIpList[wafBlackIpIdx];
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev get Ipfs CId of black ip data detected by Cloudbric WAF using Cloudbric Data Index.
    * @param _clbIndex Cloudbric Index which is used by Cloudbric Labs or Cloudbric Database.
    */
    function getWafBlackIpAtClbIndex(bytes32 _clbIndex)
        public
        view
        returns (bytes32 hash, uint8 hash_function, uint8 size)
    {
        Multihash storage multihash = wafBlackIpList[_clbIndex];
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev add Ipfs CId of black ip data which is detected by Cloudbric WAF.
    * @param _clbIndex The Index of Cloudbric ThreatDB.
    * @param _hash The Ipfs hash which came from mutlihash identifier.
    */
    function addWafBlackIp(
        bytes32 _clbIndex,
        bytes32 _hash,
        uint8 _hashFunction,
        uint8 _size
    )
        public
        onlyWhiteListed(msg.sender)
        onlyUniqueClbIndexAllowed(_clbIndex)
        returns (bool)
    {
        wbiLookUpTable.push(_clbIndex);
        wafBlackIpList[_clbIndex] = Multihash(_hash, _hashFunction, _size, true);
        emit AddWafBlackIp(msg.sender, _clbIndex, _hash, _hashFunction, _size);
        return true;
    }
}