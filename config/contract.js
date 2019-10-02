
const fs = require('fs');
const caverConfig = require('./caver');
const caver = caverConfig.caver;

const deployedMetadataOfIpfsBridge = fs.readFileSync('deployedMetadataOfIpfsBridge');
const deployedAddressOfIpfsBridge = fs.readFileSync('deployedAddressOfIpfsBridge', 'utf-8');

const abiOfIpfsBridge = JSON.parse(deployedMetadataOfIpfsBridge).abi;

const cloudbricIpfsBridge = new caver.klay.Contract(abiOfIpfsBridge, deployedAddressOfIpfsBridge); 

module.exports = {
    addressOfIpfsBridge: deployedAddressOfIpfsBridge,
    cloudbricIpfsBridge: cloudbricIpfsBridge
}