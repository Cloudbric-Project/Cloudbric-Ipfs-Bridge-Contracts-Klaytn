const CloudbricPhishingUrlStorage = artifacts.require('./CloudbricPhishingUrlStorage.sol');
const fs = require('fs');
//const testAddressOfWhiteList = fs.readFileSync('../testAddressOfWhiteList', 'utf-8');
const deployedAddressOfWhiteList = fs.readFileSync('../deployedAddressOfWhiteList', 'utf-8');

module.exports = function (deployer) {
    deployer.deploy(CloudbricPhishingUrlStorage, deployedAddressOfWhiteList)
        .then(() => {
            if (CloudbricPhishingUrlStorage._json) {
                fs.writeFile(
                    'metadata/deployedMetadataOfPhishingUrlStorage',
                    JSON.stringify(CloudbricPhishingUrlStorage._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${CloudbricPhishingUrlStorage._json.contractName} is recorded on testMetadataOfPhishingUrlStorage file`)
                    }
                )
            }
            fs.writeFile(
                'metadata/deployedAddressOfPhishingUrlStorage',
                CloudbricPhishingUrlStorage.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed address of ${CloudbricPhishingUrlStorage._json.contractName} is ${CloudbricPhishingUrlStorage.address}`)
                }
            )
        });
}