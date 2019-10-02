const CloudbricIpfsBridge = artifacts.require('./CloudbricIpfsBridge.sol');
const fs = require('fs');

module.exports = function (deployer) {
    deployer.deploy(CloudbricIpfsBridge)
        .then(() => {
            if (CloudbricIpfsBridge._json) {
                fs.writeFile(
                    'deployedMetadataOfIpfsBridge',
                    JSON.stringify(CloudbricIpfsBridge._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${CloudbricIpfsBridge._json.contractName} is recorded on deployedMetadataOfIpfsBridge file`)
                    }
                )
            }
            fs.writeFile(
                'deployedAddressOfIpfsBridge',
                CloudbricIpfsBridge.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed contract address * ${CloudbricIpfsBridge.address}`)
                }
            )
        })
}