const bs58 = require('bs58');
const constant = require('../config/constant');
const caverConfig = require('../config/caver');
const caver = caverConfig.caver;

/**
 * create Solidity data type bytes32 from Javascript String data type.
 * E.g. input: '210511986'
 * output: '0x3231303531313938360000000000000000000000000000000000000000000000'
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
 * E.g. input: '0x3231303531313938360000000000000000000000000000000000000000000000'
 * output: '210511986'
 * @param {Stirng} bytes32
 * @return {String} ascii 
 */
function bytes32ToString (bytes32) {
    ascii = caver.utils.hexToAscii(bytes32);
    return ascii;
}

/**
 * conver multihash in hexadecimal form to ipfs hash.
 * E.g. input: {
 *   hashFunction: 12
 *   size: 20
 *   hash: 29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4 
 * }
 * output: QmR9afrWU3bPzztUUstrf42EuCd74U3iNZo3MoGrjM9o3y 
 * @param {Object} multiHash
 * @return {String} ipfsHash
 */
function multihashToIpfsHash (multiHash) {
    const decodedHexString = multiHash.hashFunction + multiHash.size + multiHash.hash;
    const bytes = Buffer.from(decodedHexString, 'hex');
    const ipfsHash = bs58.encode(bytes);

    return ipfsHash;
}

/**
 * convert ipfs hash to multi hash form.
 * E.g. input: QmR9afrWU3bPzztUUstrf42EuCd74U3iNZo3MoGrjM9o3y
 * output: {
 *   hashFunction: 12
 *   size: 20
 *   hash: 29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4
 * }
 * @param {String} ipfsHash 
 * @return {Object} multiHash
 */
function ipfsHashToMultihash (ipfsHash) {
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
 * @return {Object} dummy dataset.
 */
function createDummy (idx) {
    return {
        clbIndex: 210511986 + idx,
        wafBlackIpHash: createRandomHexString(64),
        hashFunction: 12,
        size: 20
    }
}

/**
 * encode dataset.
 * E.g. input: {
 *   clbIndex: 210511986,
 *   wafBlackIpHash: '29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4',
 *   hashFunction: 12,
 *   size: 20
 * }
 * output: {
 *   encodedClbIndex: '0x3231303531313938360000000000000000000000000000000000000000000000,'
 *   encodedWafBlackIpHash: '0x29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4',
 *   encodedhHashFunction: '0x000000000000000000000000000000000000000000000000000000000000000c',
 *   encodedSize: '0x0000000000000000000000000000000000000000000000000000000000000014'
 * }
 * @param {Object} dataSet
 * @return {Object} encodedDataset
 */
function encodeDataSet (dataSet) {
    return {
        encodedClbIndex: stringToBytes32(String(dataSet.clbIndex)),
        encodedWafBlackIpHash: '0x' + dataSet.wafBlackIpHash,
        encodedHashFunction: caver.klay.abi.encodeParameter('uint8', dataSet.hashFunction),
        encodedSize: caver.klay.abi.encodeParameter('uint8', dataSet.size),
    }
}

/** 
 * decode return value(multihash) of getWafBlackIp.
 * E.g. input: {
 *   hash: '0x61b95cd325199a251d4cc03f2a4d13d6fee2b4e35785c4a62a5945cacf706b9f',
 *   hashFunction: <BN: c>,
 *   size: <BN: 14> 
 * }
 * output: {
 *   docdedHash: '61b95cd325199a251d4cc03f2a4d13d6fee2b4e35785c4a62a5945cacf706b9f',
 *   decodedHashFunction: '12'
 *   decodedSize: '20'
 * }
 * @param {Object} value returned by getWafBlackIp 
 * @return {Object} decoded multihash 
 */
function decodeMultihash (multihash) {
    console.log(multihash);
    return {
        hash: multihash.hash.slice(2),
        hashFunction: multihash.hash_function.toString(),
        size: multihash.size.toString()
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
    encodeDataSet: encodeDataSet,
    decodeMultihash, decodeMultihash,
    feeDelegatedSmartContractExecute: feeDelegatedSmartContractExecute
}
