pragma solidity 0.4.24;

import "./open-zeppelin/Ownable.sol";
import "./CloudbricIpfsBridgeAuth.sol";

/**
 * @title CloudbricIpfsBridge
 * @dev The CloudbricIpfsBridge contract has an Ipfs CId(Contents Identifier) of
 * black ips detected by Cloudbric WAF and threat datas reported by user
 * and provides get functions for who is authenticated by CloudbricIpfsBridgeAuth contract.
 */
contract CloudbricIpfsBridge is Ownable {
    /**
    * @notice This contract uses Multihash Identifier which is used by
    * Ipfs protocol.
    */
    struct Multihash {
        bytes32 hash;
        uint8 hashFunction;
        uint8 size;
    }

    struct DataStorage  {
        bytes32[] lookUpTable;
        mapping(bytes32 => Multihash) multihash;
    }

    /**
    * @dev prefix "waf" means these data is collected by Cloudbric WAF.
    */
    DataStorage private _wafBlackIps;

    /**
    * @dev prefix "ur" is abbreviation of user reported.
    * that means these data is collected by user in Cloudbric Labs (labs.cloudbric.com)
    */
    DataStorage private _urBlackIps;
    DataStorage private _urHackerWallets;
    DataStorage private _urPhishingUrls;

    CloudbricIpfsBridgeAuth cloudbricAuth;

    event GetWafBlackIp(address indexed from, bytes32 hash, uint8 hashFunction, uint8 size);
    event AddWafBlackIp(address indexed from, bytes32 clbIndex, bytes32 hash, uint8 hashFunction, uint8 size);


    modifier onlyValidIndexAllowed(bytes32 _clbIndex) {
        require(
            _clbIndex[0] != 0,
            "Valid index required.");
        _;
    }

    modifier shouldLessThanLengthOfLUT(uint _index, DataStorage ds) {
        require(
            _index < ds.lookUpTable.length,
            "Given index should less than length of data"
        );
        _;
    }

    modifier onlyUniqueMultihashAllowed(Multihash multihash) {
        require(
            multihash.hash[0] != 0 ||
            multihash.hashFunction != 0 ||
            multihash.size != 0,
            "Already exists."
        );
        _;
    }

    constructor(address _ca) public {
        cloudbricAuth = CloudbricIpfsBridgeAuth(_ca);
    }

    /**
    * @dev get length of Ipfs CIds of black ip data which is detected by Cloudbric WAF.
    */
    function wafBlackIpsSize()
        public
        view
        returns (uint)
    {
        return _wafBlackIps.lookUpTable.length;
    }

    /**
    * @dev get Ipfs CId of black ip data detected by Cloudbric WAF using index.
    */
    function getWafBlackIpAtIndex(uint _index)
        public
        shouldLessThanLengthOfLUT(_index, _wafBlackIps)
        returns (bytes32 hash, uint8 hash_funciton, uint8 size)
    {
        bytes32 wafBlackIpIdx = _wafBlackIps.lookUpTable[_index];
        Multihash storage multihash = _wafBlackIps.multihash[wafBlackIpIdx];
        emit GetWafBlackIp(msg.sender, multihash.hash, multihash.hashFunction, multihash.size);
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev get Ipfs CId of black ip data detected by Cloudbric WAF using Cloudbric Data Index.
    * @param _clbIndex Cloudbric Index which is used by Cloudbric Labs or Cloudbric Database.
    */
    function getWafBlackIpAtIndex(bytes32 _clbIndex)
        public
        onlyValidIndexAllowed(_clbIndex)
        onlyUniqueMultihashAllowed(_wafBlackIps.multihash[_clbIndex])
        returns (bytes32 hash, uint8 hash_funciton, uint8 size)
    {
        Multihash storage multihash = _wafBlackIps.multihash[_clbIndex];
        emit GetWafBlackIp(msg.sender, multihash.hash, multihash.hashFunction, multihash.size);
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
        onlyOwner
        onlyValidIndexAllowed(_clbIndex)
        onlyUniqueMultihashAllowed(_wafBlackIps.multihash[_clbIndex])
        returns (bool)
    {
        _wafBlackIps.multihash[_clbIndex] = Multihash(_hash, _hashFunction, _size);
        emit AddWafBlackIp(msg.sender, _clbIndex, _hash, _hashFunction, _size);
        return true;
    }
}