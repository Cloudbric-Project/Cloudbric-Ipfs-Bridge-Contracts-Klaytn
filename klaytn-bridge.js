const caverConfig = require('./config/caver');
const secret = require('./config/secret');
const contract = require('./config/contract');
const helper = require('./helper/helper');

const vault = secret.vault;
const caver = caverConfig.caver;
const whiteList = contract.whiteList;
const cloudbricIpfsBridge = contract.cloudbricIpfsBridge;

async function addDataToIpfs(data) {

}

async function addWafBalckIpBatch(limit) {
    caver.klay.accounts.wallet.add(
        vault.local.accounts.delegate.privateKey, 
        vault.local.accounts.delegate.address
    );
    // create new user
    caver.klay.accounts.wallet.create(limit);
    
    for (let i = 0; i < limit; i++) {
        console.log(`==================================== ${i}'th Iteration ====================================`);
        let {idxWafBlakcIpList, wafBlackIpHash, hashFunction, size} = helper.createDummy(i);

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


        /*
        // synchronize batch
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
        */

        // async batch
        helper.feeDelegatedSmartContractExecute(
            fromAddress,
            fromPrivateKey,
            contract.addressOfIpfsBridge,
            vault.local.accounts.delegate,
            abiAddWafBlackIp
        );
        console.log(`==================================== end of ${i}'th Iteration ====================================`);
    }
}

async function scanDatabase() {
    let wafBlackIpListSize = await cloudbricIpfsBridge.methods.wafBlackIpListSize().call();
    console.log(wafBlackIpListSize);

    for (let i = 0; i < wafBlackIpListSize; i++) {
        let wafBlackIp = await cloudbricIpfsBridge.methods.getWafBlackIpAtIndex(i).call();
        console.log(wafBlackIp.hash);
    }
}

//createDataBase(500);