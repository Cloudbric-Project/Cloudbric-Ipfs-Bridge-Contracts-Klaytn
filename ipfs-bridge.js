const fs = require('fs');

const secret = fs.readFileSync(".secret.json").toString();
const parsedSecret = JSON.parse(secret);

const Caver = require('caver-js');
const caver = new Caver(parsedSecret.local.URL);

const deployedAbiOfIpfsBridgeAuth = fs.readFileSync('deployedAbiOfIpfsBridgeAuth', 'utf-8');
const deployedAddressOfIpfsBridgeAuth  = fs.readFileSync('deployedAddressOfIpfsBridgeAuth', 'utf-8');

const deployedAbiOfIpfsBridge = fs.readFileSync('deployedAbiOfIpfsBridge', 'utf-8');
const deployedAddressOfIpfsBridge = fs.readFileSync('deployedAddressOfIpfsBridge', 'utf-8');

const GAS_LIMIT = 300000;

const deployer = parsedSecret.local.accounts.deployer;
const alice = parsedSecret.local.accounts.alice;


// init wallet
caver.klay.accounts.wallet.add(deployer.privateKey, deployer.address);
caver.klay.accounts.wallet.add(alice.privateKey, alice.address);

const cloudbricIpfsBridgeAuth = new caver.klay.Contract(deployedAbiOfIpfsBridgeAuth, deployedAddressOfIpfsBridgeAuth);
const cloudbricIpfsBridge = new caver.klay.Contract(deployedAbiOfIpfsBridge, deployedAddressOfIpfsBridge);

// method ABI collection
const abiWafBlackIpsSize = cloudbricIpfsBridge.methods.wafBlackIpsSize.call();

let feeDelegatedSmartContractExecute = async () => {
    let feeDelegatedSmartContractObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: alice,
        to: deployedAddressOfIpfsBridge,
        data: abiWafBlackIpsSize,
        gas: GAS_LIMIT
    };
    
}