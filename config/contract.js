const fs = require('fs')
const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')
// const caverConfig = require(`${__dirname}/caver`);
const caverConfig = require(path.join(APP_ROOT_DIR, 'config/caver'))
const caver = caverConfig.caver

const deployedMetadataOfWhiteList = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedMetadataOfWhiteList'))
const deployedAddressOfWhiteList = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedAddressOfWhiteList'), 'utf-8')
const abiOfWhiteList = JSON.parse(deployedMetadataOfWhiteList).abi

const deployedMetadataOfWafBlackIpStorage = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedMetadataOfWafBlackIpStorage'))
const deployedAddressOfWafBlackIpStorage = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedAddressOfWafBlackIpStorage'), 'utf-8')
const abiOfWafBlackIpStorage = JSON.parse(deployedMetadataOfWafBlackIpStorage).abi;

const deployedMetadataOfHackerWalletStorage = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedMetadataOfHackerWalletStorage'))
const deployedAddressOfHackerWalletStorage = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedAddressOfHackerWalletStorage'), 'utf-8')
const abiOfHackerWalletStorage = JSON.parse(deployedMetadataOfHackerWalletStorage).abi;

const deployedMetadataOfPhishingUrlStorage = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedMetadataOfPhishingUrlStorage'))
const deployedAddressOfPhishingUrlStorage = fs.readFileSync(path.join(APP_ROOT_DIR, 'metadata/deployedAddressOfPhishingUrlStorage'), 'utf-8')
const abiOfPhishingUrlStorage = JSON.parse(deployedMetadataOfPhishingUrlStorage).abi

const whiteList = new caver.klay.Contract(abiOfWhiteList, deployedAddressOfWhiteList)
const cloudbricWafBlackIpStorage = new caver.klay.Contract(abiOfWafBlackIpStorage, deployedAddressOfWafBlackIpStorage)
const cloudbricHackerWalletStorage = new caver.klay.Contract(abiOfHackerWalletStorage, deployedAddressOfHackerWalletStorage)
const cloudbricPhishingUrlStorage = new caver.klay.Contract(abiOfPhishingUrlStorage, deployedAddressOfPhishingUrlStorage)

module.exports = {
    addressOfWhiteList: deployedAddressOfWhiteList,
    whiteList: whiteList,
    addressOfWafBlackIpStorage: deployedAddressOfWafBlackIpStorage,
    cloudbricWafBlackIpStorage: cloudbricWafBlackIpStorage,
    addressOfHackerWalletStorage: deployedAddressOfHackerWalletStorage,
    cloudbricHackerWalletStorage : cloudbricHackerWalletStorage,
    addressOfPhishingUrlStorage: deployedAddressOfPhishingUrlStorage,
    cloudbricPhishingUrlStorage: cloudbricPhishingUrlStorage
}