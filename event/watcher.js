
const caverConfig = require('../config/caver');
const secret = require('../config/secret');
const contract = require('../config/contract');

const vault = secret.vault;
const caver = caverConfig.caver;

const cloudbricIpfsBridge = contract.cloudbricIpfsBridge;

cloudbricIpfsBridge.getPastEvents('AddWafBlackIp', {
    filter: {from: vault.local.accounts.alice.address},
    fromBlock: 8360000,
    toBlock: 'latest'
}, (error, event) => {
    console.log(event);
}).then((events) => {
    console.log(events);
});