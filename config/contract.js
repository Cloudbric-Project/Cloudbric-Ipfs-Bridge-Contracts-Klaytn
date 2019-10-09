
const fs = require('fs');
const caverConfig = require('./caver');
const caver = caverConfig.caver;

const deployedMetadataOfWhiteList = fs.readFileSync('deployedMetadataOfWhiteList');
const deployedAddressOfWhiteList = fs.readFileSync('deployedAddressOfWhiteList', 'utf-8');
const abiOfWhiteList = JSON.parse(deployedMetadataOfWhiteList).abi;

const deployedMetadataOfWafBlackIpStorage = fs.readFileSync('deployedMetadataOfWafBlackIpStorage');
const deployedAddressOfWafBlackIpStorage = fs.readFileSync('deployedAddressOfWafBlackIpStorage', 'utf-8');
const abiOfWafBlackIpStorage = JSON.parse(deployedMetadataOfWafBlackIpStorage).abi;

const whiteList = new caver.klay.Contract(abiOfWhiteList, deployedAddressOfWhiteList);
const cloudbricWafBlackIpStorage = new caver.klay.Contract(abiOfWafBlackIpStorage, deployedAddressOfWafBlackIpStorage); 

module.exports = {
    addressOfWhiteList: deployedAddressOfWhiteList,
    whiteList: whiteList,
    addressOfWafBlackIpStorage: deployedAddressOfWafBlackIpStorage,
    cloudbricWafBlackIpStorage: cloudbricWafBlackIpStorage
}