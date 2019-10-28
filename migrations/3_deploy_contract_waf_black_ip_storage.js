const CloudbricWafBlackIpStorage = artifacts.require('./CloudbricWafBlackIpStorage.sol');
const fs = require('fs');
const testAddressOfWhiteList = fs.readFileSync('../testAddressOfWhiteList', 'utf-8');

module.exports = function (deployer) {
    deployer.deploy(CloudbricWafBlackIpStorage, testAddressOfWhiteList, {overwrite: false})
        .then(() => {
            if (CloudbricWafBlackIpStorage._json) {
                fs.writeFile(
                    'metadata/testMetadataOfWafBlackIpStorage',
                    JSON.stringify(CloudbricWafBlackIpStorage._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${CloudbricWafBlackIpStorage._json.contractName} is recorded on deployedMetadataOfWafBlackIpStorage file`)
                    }
                )
            }
            fs.writeFile(
                'metadata/testAddressOfWafBlackIpStorage',
                CloudbricWafBlackIpStorage.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed address of ${CloudbricWafBlackIpStorage._json.contractName} is ${CloudbricWafBlackIpStorage.address}`)
                }
            )
        });
}