const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')

const caverConfig = require(path.join(APP_ROOT_DIR, 'config/caver'))
const contract = require(path.join(APP_ROOT_DIR, 'config/contract'))

const caver = caverConfig.caver
const vault = caverConfig.vault

const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage

async function addWafBlackIpPastEvents() {
    const returns = await cloudbricWafBlackIpStorage.getPastEvents('AddWafBlackIp', {
        fromBlock: 8360000,
        toBlock: 'latest'
    })
    console.log(returns)
}

addWafBlackIpPastEvents()