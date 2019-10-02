const caverConfig = require('./config/caver');
const secret = require('./config/secret');
const contract = require('./config/contract');
const constant = require('./config/constant');
const helper = require('./helper/helper');

const vault = secret.vault;
const caver = caverConfig.caver;

const cloudbricIpfsBridge = contract.cloudbricIpfsBridge;
const GAS_LIMIT = constant.GAS_LIMIT;

/**
 * run fee delegated smart contract execute.
 * @param {String} fromAddress
 * @param {String} fromPrivateKey
 * @param {Object} delegate
 * @param {Object} abiOfMethod
 */
async function feeDelegatedSmartContractExecute (
    fromAddress, 
    fromPrivateKey,
    to, 
    delegate, 
    abiOfMethod
) {
    let feeDelegatedSmartContractObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: fromAddress,
        to: to,
        data: abiOfMethod,
        gas: GAS_LIMIT,
    };

    let rlpEncodedTransaction = null;
    try {
        rlpEncodedTransaction = await caver.klay.accounts.signTransaction(
            feeDelegatedSmartContractObject,
            fromPrivateKey
        );
    } catch (error) {
        throw Error(error);
    }
    console.log("==================== rlpEncodedTransaction created ====================");
    let receipt = null;
    try {
        receipt = await caver.klay.sendTransaction({
            senderRawTransaction: rlpEncodedTransaction.rawTransaction,
            feePayer: delegate.address,
        });
    } catch (error) {
        throw Error(error);
    }
    return receipt;
}

function createDummy(i) {
    return {
        idxWafBlakcIpList: i,
        wafBlackIpHash: helper.createRandomHexString(30),
        hashFunction: '0x12',
        size: '0x20'
    }
}

async function createDataBase() {
    console.log(`==================================== create database ====================================`);
    const limit = 1000;
    caver.klay.accounts.wallet.add(
        vault.local.accounts.delegate.privateKey, 
        vault.local.accounts.delegate.address
    );
    // create new user
    caver.klay.accounts.wallet.create(limit);
    
    for (let i = 0; i < limit; i++) {
        console.log(`==================================== ${i}'th Iteration ====================================`);
        // dummy data
        let returned = createDummy(i);
        let idxWafBlakcIpList = returned.idxWafBlakcIpList;
        let wafBlackIpHash = returned.wafBlackIpHash;
        let hashFunction = returned.hashFunction;
        let size = returned.size;

        let key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        let fromPrivateKey = key.slice(0,66);
        let fromAddress = key.slice(70,140);

        let encodedIdxBlackIpList = helper.stringToBytes32(idxWafBlakcIpList);
        let encodedWafBlackIpHash = helper.stringToBytes32(wafBlackIpHash);

        let encodedHashFunction = caver.klay.abi.encodeParameter('uint8', hashFunction);
        let encodedSize = caver.klay.abi.encodeParameter('uint8', size);

        let abiAddWafBlackIp = 
            cloudbricIpfsBridge.methods.addWafBlackIp(
                encodedIdxBlackIpList, 
                encodedWafBlackIpHash, 
                encodedHashFunction, 
                encodedSize
            ).encodeABI();

        let result = null; 
        try {
            result = await feeDelegatedSmartContractExecute(
                fromAddress,
                fromPrivateKey,
                contract.addressOfIpfsBridge,
                vault.local.accounts.delegate,
                abiAddWafBlackIp
            );
        } catch (error) {
            console.log(error);
            // error recover process
        }
        console.log(`========================================================================`); 
    }
}

async function scanDatabase() {
    let wafBlackIpListSize = await cloudbricIpfsBridge.methods.wafBlackIpListSize().call();
    console.log(wafBlackIpListSize);
}

//createDataBase();
scanDatabase();