const CloudbricHackerWalletStorage = artifacts.require('./CloudbricHackerWalletStorage.sol');
const fs = require('fs');
//const testAddressOfWhiteList = fs.readFileSync('../testAddressOfWhiteList', 'utf-8');
const deployedAddressOfWhiteList = fs.readFileSync('../deployedAddressOfWhiteList', 'utf-8');

module.exports = function (deployer) {
    deployer.deploy(CloudbricHackerWalletStorage, deployedAddressOfWhiteList)
        .then(() => {
            if (CloudbricHackerWalletStorage._json) {
                fs.writeFile(
                    'metadata/deployedMetadataOfHackerWalletStorage',
                    JSON.stringify(CloudbricHackerWalletStorage._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${CloudbricHackerWalletStorage._json.contractName} is recorded on testMetadataOfHackerWalletStorage file`)
                    }
                )
            }
            fs.writeFile(
                'metadata/deployedAddressOfHackerWalletStorage',
                CloudbricHackerWalletStorage.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed address of ${CloudbricHackerWalletStorage._json.contractName} is ${CloudbricHackerWalletStorage.address}`)
                }
            )
        });
}