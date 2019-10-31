const fs = require('fs');
const caverConfig = require(`${__dirname}/caver`);
const caver = caverConfig.caver;

const deployedMetadataOfWhiteList = fs.readFileSync(`${__dirname}/../metadata/deployedMetadataOfWhiteList`);
const deployedAddressOfWhiteList = fs.readFileSync(`${__dirname}/../metadata/deployedAddressOfWhiteList`, 'utf-8');
const abiOfWhiteList = JSON.parse(deployedMetadataOfWhiteList).abi;

const deployedMetadataOfWafBlackIpStorage = fs.readFileSync(`${__dirname}/../metadata/deployedMetadataOfWafBlackIpStorage`);
const deployedAddressOfWafBlackIpStorage = fs.readFileSync(`${__dirname}/../metadata/deployedAddressOfWafBlackIpStorage`, 'utf-8');
const abiOfWafBlackIpStorage = JSON.parse(deployedMetadataOfWafBlackIpStorage).abi;

const deployedMetadataOfHackerWalletStorage = fs.readFileSync(`${__dirname}/../metadata/deployedMetadataOfHackerWalletStorage`);
const deployedAddressOfHackerWalletStorage = fs.readFileSync(`${__dirname}/../metadata/deployedAddressOfHackerWalletStorage`, 'utf-8');
const abiOfHackerWalletStorage = JSON.parse(deployedMetadataOfHackerWalletStorage).abi;

const deployedMetadataOfPhishingUrlStorage = fs.readFileSync(`${__dirname}/../metadata/deployedMetadataOfPhishingUrlStorage`);
const deployedAddressOfPhishingUrlStorage = fs.readFileSync(`${__dirname}/../metadata/deployedAddressOfPhishingUrlStorage`, 'utf-8');
const abiOfPhishingUrlStorage = JSON.parse(deployedMetadataOfPhishingUrlStorage).abi;

const whiteList = new caver.klay.Contract(abiOfWhiteList, deployedAddressOfWhiteList);
const cloudbricWafBlackIpStorage = new caver.klay.Contract(abiOfWafBlackIpStorage, deployedAddressOfWafBlackIpStorage); 
const cloudbricHackerWalletStorage = new caver.klay.Contract(abiOfHackerWalletStorage, deployedAddressOfHackerWalletStorage); 
const cloudbricPhishingUrlStorage = new caver.klay.Contract(abiOfPhishingUrlStorage, deployedAddressOfPhishingUrlStorage); 

module.exports = {
    addressOfWhiteList: deployedAddressOfWhiteList,
    whiteList: whiteList,
    addressOfWafBlackIpStorage: deployedAddressOfWafBlackIpStorage,
    cloudbricWafBlackIpStorage: cloudbricWafBlackIpStorage,
    cloudbricHackerWalletStorage : cloudbricHackerWalletStorage,
    cloudbricPhishingUrlStorage: cloudbricPhishingUrlStorage
}