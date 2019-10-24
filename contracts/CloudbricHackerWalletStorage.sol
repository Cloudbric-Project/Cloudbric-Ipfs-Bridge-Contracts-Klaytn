pragma solidity 0.4.24;

import "./open-zeppelin/Ownable.sol";
import "./WhiteList.sol";

/**
 * @title CloudbricHackerWalletStorage
 * @dev This contract has an Ipfs CId(Contents Identifier) of
 * hacker wallet reported by user.
 */
contract CloudbricHackerWalletStorage is Ownable {
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
    mapping(bytes32 => Multihash) public urHackerWalletList;
    bytes32[] public hwLookUpTable;

    WhiteList public whiteList;

    event AddHackerWallet(address indexed from, bytes32 clbIndex, bytes32 hash, uint8 hashFunction, uint8 size);

    modifier onlyWhiteListed(address _addr) {
        require(
            whiteList.isWhiteListed(_addr),
            "Only white listed account can add data"
        );
        _;
    }

    modifier onlyUniqueClbIndexAllowed(bytes32 _clbIndex) {
        require(
            urHackerWalletList[_clbIndex].isExist == false,
            "Only unique clbIndex can be added"
        );
        _;
    }

    constructor(address whiteListContractAddress) public {
        whiteList = WhiteList(whiteListContractAddress);
    }

    /**
    * @dev get length of Ipfs CIds of hacker wallet data which is reported by user.
    */
    function urHackerWalletListSize()
        public
        view
        returns (uint)
    {
        return hwLookUpTable.length;
    }

    /**
    * @dev get Ipfs CId of hacker wallet data reported by user using index.
    * @notice you should know size of lookup table.
    */
    function getHackerWalletAtIndex(uint _index)
        public
        view
        returns (bytes32 hash, uint8 hash_function, uint8 size)
    {
        bytes32 phishingUrlIdx = hwLookUpTable[_index];
        require(
            _index < hwLookUpTable.length,
            "Given index is out of bound."
        );

        Multihash storage multihash = urHackerWalletList[phishingUrlIdx];
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev get Ipfs CId of hacker wallet data reported by user using Cloudbric Data Index.
    * @param _clbIndex Cloudbric Index which is used by Cloudbric Labs or Cloudbric Database.
    */
    function getHackerWalletAtClbIndex(bytes32 _clbIndex)
        public
        view
        returns (bytes32 hash, uint8 hash_function, uint8 size)
    {
        Multihash storage multihash = urHackerWalletList[_clbIndex];
        return (multihash.hash, multihash.hashFunction, multihash.size);
    }

    /**
    * @dev add Ipfs CId of hacker wallet data which is reported by user.
    * @param _clbIndex The Index of Cloudbric ThreatDB.
    * @param _hash The Ipfs hash which came from mutlihash identifier.
    */
    function addHackerWallet(
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
        hwLookUpTable.push(_clbIndex);
        urHackerWalletList[_clbIndex] = Multihash(_hash, _hashFunction, _size, true);
        emit AddHackerWallet(msg.sender, _clbIndex, _hash, _hashFunction, _size);
        return true;
    }
}