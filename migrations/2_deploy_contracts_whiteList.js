const WhiteList = artifacts.require('./WhiteList.sol');
const fs = require('fs');

module.exports = function (deployer) {
    deployer.deploy(WhiteList, {overwrite: false})
        .then(() => {
            if (WhiteList._json) {
                fs.writeFile(
                    'metadata/testMetadataOfWhiteList',
                    JSON.stringify(WhiteList._json, 2),
                    (err) => {
                        if (err) throw err
                        console.log(`The metadata of ${WhiteList._json.contractName} is recorded on testMetadataOfWhiteList file`)
                    }
                )
            }
            fs.writeFile(
                'metadata/testAddressOfWhiteList',
                WhiteList.address,
                (err) => {
                    if (err) throw err
                    console.log(`The deployed address of ${WhiteList._json.contractName} is ${WhiteList.address}`)
                }
            )
        })
}