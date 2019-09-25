const CloudbricIpfsBridge = artifacts.require('./CloudbricIpfsBridge.sol');
const fs = require('fs');
const ipfsBridgeAuthContractAddress = fs.readFileSync('../deployedAddressOfIpfsBridgeAuth', 'utf-8');

module.exports = function (deployer) {
    deployer.deploy(CloudbricIpfsBridge, ipfsBridgeAuthContractAddress)
        .then(() => {
            if (CloudbricIpfsBridge._json) {
                fs.writeFile(
                    'deployedAbiOfIpfsBridge',
                    JSON.stringify(CloudbricIpfsBridge._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The abi of ${CloudbricIpfsBridge._json.contractName} is recorded on deployedAbiOfIpfsBridge file`)
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