
const caverConfig = require('../config/caver');
const contract = require('../config/contract');

const caver = caverConfig.caver;
const vault = caverConfig.vault;

const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage;

async function addWafBlackIpPastEvents() {
    const returns = await cloudbricWafBlackIpStorage.getPastEvents('AddWafBlackIp', {
        fromBlock: 8360000,
        toBlock: 'latest'
    });
    console.log(returns);
}

addWafBlackIpPastEvents();