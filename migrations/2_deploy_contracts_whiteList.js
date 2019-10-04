const WhiteList = artifacts.require('./WhiteList.sol');
const fs = require('fs');

module.exports = function (deployer) {
    deployer.deploy(WhiteList)
        .then(() => {
            if (WhiteList._json) {
                fs.writeFile(
                    'deployedMetadataOfWhiteList',
                    JSON.stringify(WhiteList._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${WhiteList._json.contractName} is recorded on deployedMetadataOfWhiteList file`)
                    }
                )
            }
            fs.writeFile(
                'deployedAddressOfWhiteList',
                WhiteList.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed address of ${WhiteList._json.contractName} is ${WhiteList.address}`)
                }
            )
        })
}