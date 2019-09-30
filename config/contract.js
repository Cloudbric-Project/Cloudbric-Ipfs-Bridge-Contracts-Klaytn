
const fs = require('fs');
const caverConfig = require('./caver');
const caver = caverConfig.caver;

const deployedMetadataOfIpfsBridgeAuth = fs.readFileSync('deployedMetadataOfIpfsBridgeAuth');
const deployedAddressOfIpfsBridgeAuth  = fs.readFileSync('deployedAddressOfIpfsBridgeAuth', 'utf-8');

const deployedMetadataOfIpfsBridge = fs.readFileSync('deployedMetadataOfIpfsBridge');
const deployedAddressOfIpfsBridge = fs.readFileSync('deployedAddressOfIpfsBridge', 'utf-8');

const abiOfIpfsBridgeAuth = JSON.parse(deployedMetadataOfIpfsBridgeAuth).abi;
const abiOfIpfsBridge = JSON.parse(deployedMetadataOfIpfsBridge).abi;

const cloudbricIpfsBridgeAuth = new caver.klay.Contract(abiOfIpfsBridgeAuth, deployedAddressOfIpfsBridgeAuth);
const cloudbricIpfsBridge = new caver.klay.Contract(abiOfIpfsBridge, deployedAddressOfIpfsBridge); 

module.exports = {
    addressOfIpfsBridgeAuth: deployedAddressOfIpfsBridgeAuth,
    addressOfIpfsBridge: deployedAddressOfIpfsBridge,
    cloudbricIpfsBridgeAuth: cloudbricIpfsBridgeAuth,
    cloudbricIpfsBridge: cloudbricIpfsBridge
}