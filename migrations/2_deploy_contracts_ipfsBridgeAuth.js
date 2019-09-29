const CloudbricIpfsBridgeAuth = artifacts.require("./CloudbricIpfsBridgeAuth.sol");
const fs = require('fs');

module.exports = function (deployer) {
    deployer.deploy(CloudbricIpfsBridgeAuth)
        .then(() => {
            if (CloudbricIpfsBridgeAuth._json) {
                fs.writeFile(
                    'deployedMetadataOfIpfsBridgeAuth',
                    JSON.stringify(CloudbricIpfsBridgeAuth._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${CloudbricIpfsBridgeAuth._json.contractName} is recorded on deployedOfIpfsBridgeAuth file`)
                    }
                )
            }
            fs.writeFile(
                'deployedAddressOfIpfsBridgeAuth',
                CloudbricIpfsBridgeAuth.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed contract address * ${CloudbricIpfsBridgeAuth.address}`)
                }
            )
        })
}