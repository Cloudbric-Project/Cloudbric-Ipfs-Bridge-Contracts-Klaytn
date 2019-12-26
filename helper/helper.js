const _ = require('underscore')
const bs58 = require('bs58')
const constant = require('../config/constant')
const caverConfig = require('../config/caver')
const caver = caverConfig.caver

/**
 * create Solidity data type bytes32 from Javascript String data type.
 * E.g. input: '210511986'
 * output: '0x3231303531313938360000000000000000000000000000000000000000000000'
 * @method stringToBytes32
 * @param {String} stringData
 * @return {String} bytes32
 */
const stringToBytes32 = (stringData) => {
    if (!_.isString(stringData)) {
        throw new Error(`The parameter ${stringData} must be a valid string.`)
    }
    hexConverted = caver.utils.asciiToHex(stringData)
    bytes32 = caver.utils.padRight(hexConverted, 64)
    return bytes32
}

/**
 * convert bytes32 to Javascript String data type.
 * E.g. input: '0x3231303531313938360000000000000000000000000000000000000000000000'
 * output: '210511986'
 * @param {Stirng} bytes32
 * @return {String} ascii 
 */
const bytes32ToString = (bytes32) => {
    if (!_.isString(bytes32)) {
        throw new Error(`The parameter ${stringData} must be a valid HEX string.`)
    }
    ascii = caver.utils.hexToAscii(bytes32)
    return ascii
}

/**
 * conver multihash in hexadecimal form to ipfshash.
 * E.g. input: {
 *   hashFunction: 12
 *   size: 20
 *   hash: 29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4 
 * }
 * output: QmR9afrWU3bPzztUUstrf42EuCd74U3iNZo3MoGrjM9o3y 
 * @param {Object} multiHash
 * @return {String} ipfsHash
 */
const multihashToIpfsHash = (multiHash) => {
    if(!_.isObject(multiHash)) {
        throw new Error(`The parameter ${multiHash} must be a valid Object.`)
    }
    const requiredFields = ['hashFunction', 'size', 'hash']
    const fields = _.allKeys(multiHash)
    requiredFields.forEach(field => {
        if(_.indexOf(fields, field) === -1)
            throw new Error(`The parameter ${mutlihash} must have a valid fields.`)
    })
    
    const decodedHexString = multiHash.hashFunction + multiHash.size + multiHash.hash
    const bytes = Buffer.from(decodedHexString, 'hex')
    const ipfsHash = bs58.encode(bytes)

    return ipfsHash
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
const ipfsHashToMultihash = (ipfsHash) => {
    if (!_.isString(ipfsHash)) {
        throw new Error(`The parameter ${ipfsHash} must be a valid string.`)
    }
    const decodedHexString = bs58.decode(ipfsHash).toString('hex')
    
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
const createRandomHexString = (length) => {
    var result = ''
    var characters = 'ABCDEF0123456789'
    var charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

/**
 * create dummy dataset.
 * @param {Number} idx
 * @return {Object} dummy dataset.
 */
const createDummy = (idx) => {
    if (!_.isNumber(idx)) {
        throw new Error(`The parameter ${ipfsHash} must be a valid number.`)
    }
    return {
        clbIndex: 210511986 + idx,
        hash: createRandomHexString(64),
        hashFunction: 12,
        size: 20
    }
}

/**
 * encode dataset.
 * E.g. input: {
 *   clbIndex: 210511986,
 *   hash: '29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4',
 *   hashFunction: 12,
 *   size: 20
 * }
 * output: {
 *   encodedClbIndex: '0x3231303531313938360000000000000000000000000000000000000000000000,'
 *   encodedHash: '0x29bd1aeb9d743a6fd89322b25e0f45a4d851af9c359c74b3eb4a7a72877b1da4',
 *   encodedhHashFunction: '0x000000000000000000000000000000000000000000000000000000000000000c',
 *   encodedSize: '0x0000000000000000000000000000000000000000000000000000000000000014'
 * }
 * @param {Object} dataSet
 * @return {Object} encodedDataset
 */
const encodeDataSet = (dataSet) => {
    if (!_.isObject(dataSet)) {
        throw new Error(`The parameter ${dataSet} must be a valid Object.`)
    }
    const requiredFields = ['clbIndex', 'hash', 'hashFunction']
    const fields = _.allKeys(dataSet)
    requiredFields.forEach(field => {
        if (_.indexOf(fields, field) === -1)
            throw new Error(`The parameter ${dataSet} must have a valid fields.`)
    })
    return {
        encodedClbIndex: stringToBytes32(String(dataSet.clbIndex)),
        encodedHash: '0x' + dataSet.hash,
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
const decodeMultihash = (multihash) => {
    if(!_.isObject(multiHash)) {
        throw new Error(`The parameter ${multiHash} must be a valid Object.`)
    }
    const requiredFields = ['hashFunction', 'size', 'hash']
    const fields = _.allKeys(multiHash)
    requiredFields.forEach(field => {
        if(_.indexOf(fields, field) === -1)
            throw new Error(`The parameter ${mutlihash} must have a valid fields.`)
    })
    console.log(multihash)
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
 * @param {String} address of smart contract
 * @param {Object} feePayer 
 * @param {Object} abiOfMethod
 * @return {Object} receipt of transaction 
 */
const feeDelegatedSmartContractExecute = async(
    fromAddress, 
    fromPrivateKey,
    to, 
    feePayer, 
    abiOfMethod
) => {
    if (!caver.utils.isAddress(fromAddress)) {
        throw new Error(`The parameter ${fromAddress} must be a valid address`)
    } else if (!caver.utils.isAddress(to)) {
        throw new Error(`The parameter ${to} must be a valid address`)
    } else if (!caver.utils.isAddress(feePayer.address)) {
        throw new Error(`The parameter ${feePayer.address} must be a valid address`)
    }

    if (!caver.utils.isHex(fromPrivateKey)) {
        throw new Error(`The parameter ${fromAddress} must be a valid HEX string`)
    }

    let feeDelegatedSmartContractObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: fromAddress,
        to: to,
        data: abiOfMethod,
        gas: constant.GAS_LIMIT,
    }

    let rlpEncodedTransaction = null
    try {
        rlpEncodedTransaction = await caver.klay.accounts.signTransaction(
            feeDelegatedSmartContractObject,
            fromPrivateKey
        )
    } catch (error) {
        console.log(error)
        throw Error(error)
    }

    let receipt = null
    try {
        receipt = await caver.klay.sendTransaction({
            senderRawTransaction: rlpEncodedTransaction.rawTransaction,
            feePayer: feePayer.address
        })
    } catch (error) {
        throw Error(error)
    }
    return receipt
}

/**
 * create error message.
 * @param {String} message 
 * @param {String} filename where error occurs
 */
const createErrorMessage = (message, filename) => {
    if (!_.isString(message)) {
        throw new Error(`The parameter ${message} must be a valid HEX string`)
    }
    const template = 
        `[Klaytn] failed to ${message}
        Check ${filename}\` in shell to sovle issue.`

    return template
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
    feeDelegatedSmartContractExecute: feeDelegatedSmartContractExecute,
    createErrorMessage: createErrorMessage
}
