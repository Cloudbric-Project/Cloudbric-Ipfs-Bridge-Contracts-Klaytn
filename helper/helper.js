const bs58 = require('bs58');
const constant = require('../config/constant');
const caverConfig = require('../config/caver');
const caver = caverConfig.caver;

/**
 * create Solidity data type bytes32 from Javascript String data type.
 * @method stringToBytes32
 * @param {String} stringData
 * @return {String} bytes32
 */
function stringToBytes32 (stringData) {
    hexConverted = caver.utils.asciiToHex(stringData);
    bytes32 = caver.utils.padRight(hexConverted, 64);
    return bytes32;
}

/**
 * convert bytes32 to Javascript String data type.
 * @param {Stirng} bytes32
 * @return {String} ascii 
 */
function bytes32ToString(bytes32) {
    ascii = caver.utils.hexToAscii(bytes32);
    return ascii;
}

/**
 * conver multi hash in hexadecimal form to ipfs hash.
 * @param {Object} multiHash
 * @return {String} ipfsHash
 */
function multihashToIpfsHash(multiHash) {
    const decodedHexString = multiHash.hashFunction + multiHash.size + multiHash.hash;
    const bytes = Buffer.from(decodedHexString, 'hex');
    const ipfsHash = bs58.encode(bytes);

    return ipfsHash;
}

/**
 * conver ipfs hash to multi hash form.
 * @param {String} ipfsHash 
 * @return {Object} multiHash
 */
function ipfsHashToMultihash(ipfsHash) {
    const decodedHexString = bs58.decode(ipfsHash).toString('hex');
    
    return {
        hashFunction: decodedHexString.slice(0,2),
        size: decodedHexString.slice(2,4),
        hash: decodedHexString.slice(4) 
    }
}

/**
 * create random hex string.
 * @param {Number} length
 * @return {String} random hex string.
 */
function createRandomHexString (length) {
    var result = '';
    var characters = 'ABCDEF0123456789';
    var charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * create dummy dataset.
 * @param {Number} idx
 * @return {Object} dummy data set.
 */
function createDummy(idx) {
    return {
        idxWafBlakcIpList: idx,
        wafBlackIpHash: createRandomHexString(30),
        hashFunction: '0x12',
        size: '0x20'
    }
}

function encodeDataSet(dataSet) {
    return {
        encodedIdxBlackIpList: caver.klay.abi.encodeParameter('uint8', dataSet.idxWafBlakcIpList),
        encodedWafBlackIpHash: stringToBytes32(dataSet.wafBlackIpHash),
        encodedHashFunction: caver.klay.abi.encodeParameter('uint8', dataSet.hashFunction),
        encodedSize: caver.klay.abi.encodeParameter('uint8', dataSet.size),
    }
}

/**
 * run fee delegated smart contract execute.
 * @param {String} fromAddress
 * @param {String} fromPrivateKey
 * @param {Object} delegate
 * @param {Object} abiOfMethod
 */
async function feeDelegatedSmartContractExecute (
    fromAddress, 
    fromPrivateKey,
    to, 
    delegate, 
    abiOfMethod
) {
    let feeDelegatedSmartContractObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: fromAddress,
        to: to,
        data: abiOfMethod,
        gas: constant.GAS_LIMIT,
    };

    let rlpEncodedTransaction = null;
    try {
        rlpEncodedTransaction = await caver.klay.accounts.signTransaction(
            feeDelegatedSmartContractObject,
            fromPrivateKey
        );
    } catch (error) {
        throw Error(error);
    }
    let receipt = null;
    try {
        receipt = await caver.klay.sendTransaction({
            senderRawTransaction: rlpEncodedTransaction.rawTransaction,
            feePayer: delegate.address,
        });
    } catch (error) {
        throw Error(error);
    }
    return receipt;
}

module.exports = {
    stringToBytes32: stringToBytes32,
    bytes32ToString: bytes32ToString,
    multihashToIpfsHash: multihashToIpfsHash,
    ipfsHashToMultihash, ipfsHashToMultihash,
    createRandomHexString: createRandomHexString,
    createDummy: createDummy,
    encodedDataSet: encodeDataSet,
    feeDelegatedSmartContractExecute: feeDelegatedSmartContractExecute
}