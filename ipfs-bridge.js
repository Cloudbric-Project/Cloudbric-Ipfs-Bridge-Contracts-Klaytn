const fs = require('fs');

const secret = fs.readFileSync(".secret.json").toString();
const parsedSecret = JSON.parse(secret);

const Caver = require('caver-js');
const caver = new Caver(parsedSecret.local.URL);

let deployedMetadataOfIpfsBridgeAuth = fs.readFileSync('deployedMetadataOfIpfsBridgeAuth');
let deployedAddressOfIpfsBridgeAuth  = fs.readFileSync('deployedAddressOfIpfsBridgeAuth', 'utf-8');

let deployedMetadataOfIpfsBridge = fs.readFileSync('deployedMetadataOfIpfsBridge');
let deployedAddressOfIpfsBridge = fs.readFileSync('deployedAddressOfIpfsBridge', 'utf-8');

let abiOfIpfsBridgeAuth = JSON.parse(deployedMetadataOfIpfsBridgeAuth).abi;
let abiOfIpfsBridge = JSON.parse(deployedMetadataOfIpfsBridge).abi;
const GAS_LIMIT = 300000;

const deployer = parsedSecret.local.accounts.deployer;
const alice = parsedSecret.local.accounts.alice;
const delegate = parsedSecret.local.accounts.delegate;

// init wallet
caver.klay.accounts.wallet.add(deployer.privateKey, deployer.address);
caver.klay.accounts.wallet.add(alice.privateKey, alice.address);

let addr = alice.address;
caver.klay.accounts.wallet[addr].privateKey;

const cloudbricIpfsBridgeAuth = new caver.klay.Contract(abiOfIpfsBridgeAuth, deployedAddressOfIpfsBridgeAuth);
const cloudbricIpfsBridge = new caver.klay.Contract(abiOfIpfsBridge, deployedAddressOfIpfsBridge);

// method ABI collection
const abiWafBlackIpsSize = cloudbricIpfsBridge.methods.wafBlackIpsSize.call().encodeABI();
console.log(abiWafBlackIpsSize);

async function feeDelegatedSmartContractExecute () {
    let feeDelegatedSmartContractObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: alice.address,
        to: deployedAddressOfIpfsBridge,
        data: abiWafBlackIpsSize,
        gas: GAS_LIMIT
    };

    let rlpEncodedTransaction = null;
    try {
        rlpEncodedTransaction = await caver.klay.accounts.signTransaction(
            feeDelegatedSmartContractObject,
            caver.klay.accounts.wallet[alice.address].privateKey
        );
    } catch (error) {
        throw Error(error);
    }

    console.log(rlpEncodedTransaction);

    let recipt = null;
    try {
        receipt = await caver.klay.sendTransaction({
            senderRawTransaction: rlpEncodedTransaction.rawTransaction,
            feePayer: delegate.address,
        });
    } catch (error) {
        throw Error(error);
    }
    console.log(receipt);
}

feeDelegatedSmartContractExecute()
    .catch(
        (error) => {
            console.log(error)
        }
    );