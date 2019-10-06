
const fs = require('fs');
const caverConfig = require('./caver');
const caver = caverConfig.caver;

const deployedMetadataOfWhiteList = fs.readFileSync('deployedMetadataOfWhiteList');
const deployedAddressOfWhiteList = fs.readFileSync('deployedAddressOfWhiteList', 'utf-8');

const deployedMetadataOfIpfsBridge = fs.readFileSync('deployedMetadataOfIpfsBridge');
const deployedAddressOfIpfsBridge = fs.readFileSync('deployedAddressOfIpfsBridge', 'utf-8');

const abiOfWhiteList = JSON.parse(deployedMetadataOfWhiteList).abi;
const abiOfIpfsBridge = JSON.parse(deployedMetadataOfIpfsBridge).abi;

const whiteList = new caver.klay.Contract(abiOfWhiteList, deployedAddressOfWhiteList);
const cloudbricIpfsBridge = new caver.klay.Contract(abiOfIpfsBridge, deployedAddressOfIpfsBridge); 

module.exports = {
    addressOfWhiteList: deployedAddressOfWhiteList,
    whiteList: whiteList,
    addressOfIpfsBridge: deployedAddressOfIpfsBridge,
    cloudbricIpfsBridge: cloudbricIpfsBridge
}