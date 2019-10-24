pragma solidity 0.4.24;

import "./open-zeppelin/Ownable.sol";
import "./WhiteList.sol";

/**
 * @title CloudbricPhishingUrlStorage
 * @dev This contract has an Ipfs CId(Contents Identifier) of
 * phishing url reported by user.
 */
contract CloudbricPhishingUrlStorage is Ownable {
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
    * @dev prefix "ur" is shortcut of "user reported" which means these data is collected by user.
    */
    mapping(bytes32 => Multihash) public urPhishingUrlList;
    bytes32[] public puLookUpTable;

    WhiteList public whiteList;

    event AddPhishingUrl(address indexed from, bytes32 clbIndex, bytes32 hash, uint8 hashFunction, uint8 size);

    modifier onlyWhiteListed(address _addr) {
        require(
            whiteList.isWhiteListed(_addr),
            "Only white listed account can add data"
        );
        _;
    }

    modifier onlyUniqueClbIndexAllowed(bytes32 _clbIndex) {
        require(
            urPhishingUrlList[_clbIndex].isExist == false,
            "Only unique clbIndex can be added"
        );
        _;
    }

    constructor(address whiteListContractAddress) public {
        whiteList = WhiteList(whiteListContractAddress);
    }

    /**
    * @dev get length of Ipfs CIds of phishing url data which is reported by user.
    */
    function urPhishingUrlListSize()
        public
        view
        returns (uint)
    {
        return puLookUpTable.length;
    }

    /**
    * @dev get Ipfs CId of phishing url data reported by user using index.
    * @notice you should know size of lookup table.
    */
    function getPhishingUrlAtIndex(uint _index)
        public
        view
        returns (bytes32 hash, uint8 hash_function, uint8 size)
    {
        bytes32 phishingUrlIdx = puLookUpTable[_index];
        require(
            _index < puLookUpTable.length,
            "Given index is out of bound."
        );

        Multihash storage multihash = urPhishingUrlList[phishingUrlIdx];
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev get Ipfs CId of phishing url data reported by user using Cloudbric Data Index.
    * @param _clbIndex Cloudbric Index which is used by Cloudbric Labs or Cloudbric Database.
    */
    function getPhishingUrlAtClbIndex(bytes32 _clbIndex)
        public
        view
        returns (bytes32 hash, uint8 hash_function, uint8 size)
    {
        Multihash storage multihash = urPhishingUrlList[_clbIndex];
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev add Ipfs CId of phishing url data which is reported by user.
    * @param _clbIndex The Index of Cloudbric ThreatDB.
    * @param _hash The Ipfs hash which came from mutlihash identifier.
    */
    function addPhishingUrl(
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
        puLookUpTable.push(_clbIndex);
        urPhishingUrlList[_clbIndex] = Multihash(_hash, _hashFunction, _size, true);
        emit AddPhishingUrl(msg.sender, _clbIndex, _hash, _hashFunction, _size);
        return true;
    }
}