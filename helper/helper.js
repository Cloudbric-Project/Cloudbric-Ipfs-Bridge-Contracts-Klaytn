const caverConfig = require('../config/caver');
const caver = caverConfig.caver;

/**
 * create Solidity data type bytes32 from Javascript string data type.
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

module.exports = {
    stringToBytes32: stringToBytes32,
    createRandomHexString: createRandomHexString 
}