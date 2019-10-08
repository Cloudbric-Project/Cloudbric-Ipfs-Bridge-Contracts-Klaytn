const CloudbricWafBlackIpStorage = artifacts.require('./CloudbricWafBlackIpStorage.sol');
const fs = require('fs');
const deployedAddressOfWhiteList = fs.readFileSync('../deployedAddressOfWhiteList', 'utf-8');

module.exports = function (deployer) {
    deployer.deploy(CloudbricWafBlackIpStorage, deployedAddressOfWhiteList)
        .then(() => {
            if (CloudbricWafBlackIpStorage._json) {
                fs.writeFile(
                    'deployedMetadataOfWafBlackIpStorage',
                    JSON.stringify(CloudbricWafBlackIpStorage._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${CloudbricWafBlackIpStorage._json.contractName} is recorded on deployedMetadataOfWafBlackIpStorage file`)
                    }
                )
            }
            fs.writeFile(
                'deployedAddressOfWafBlackIpStorage',
                CloudbricWafBlackIpStorage.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed address of ${CloudbricWafBlackIpStorage._json.contractName} is ${CloudbricWafBlackIpStorage.address}`)
                }
            )
        })
}