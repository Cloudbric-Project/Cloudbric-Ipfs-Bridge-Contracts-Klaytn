const fs = require('fs');
const path = require('path');
const appDir = path.dirname('index.js');
const caverConfig = require(`${appDir}/config/caver`);
const contract = require(`${appDir}/config/contract`);
const helper = require(`${appDir}/helper/helper`);
const logger = require(`${appDir}/helper/logger`);
const dbPromiseInterface = require(`${appDir}/db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

const vault = caverConfig.vault;
const caver = caverConfig.caver;
const klaytnLogger = logger.getLogger("klaytn")
const whiteList = contract.whiteList;
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage;
/*
async function addWhiteListBatch() {
    caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey, 
        vault.cypress.accounts.delegate.address
    );

    // parse account file and add
    const files = fs.readdirSync(`${appDir}/account`);
    files.forEach((file) => {
        let accountFile = fs.readFileSync(`${appDir}/account/${file}`, 'utf-8');
        let accountJson = JSON.parse(accountFile);
        console.log(accountJson);
        caver.klay.accounts.wallet.add(
            accountJson.privateKey,
            accountJson.address
        );
        let abiAddWhiteList = 
            whiteList.methods.addWhiteList(
                accountJson.address
            ).encodeABI();
        helper.feeDelegatedSmartContractExecute(
            vault.cypress.accounts.deployer.address,
            vault.cypress.accounts.deployer.privateKey,
            contract.addressOfWhiteList,
            vault.cypress.accounts.delegate,
            abiAddWhiteList
        );
    });
}
//createAccount(100);
//addWhiteListBatch();
*/
/*
async function createAccount(num) {
    caver.klay.accounts.wallet.create(num);
    for (let i = 0; i < num; i++) {
        let key = caver.klay.accounts.wallet.getKlaytnWalletKey(i);
        let account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        };
        fs.writeFileSync(`${appDir}/account/${account.address}.json`, JSON.stringify(account));
        // create account file in /account
    }
}
*/
const INITIAL_TO_BE_INSERTED_IDX = 210511986;

async function addWafBalckIpBatch(limit) {
    caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey, 
        vault.cypress.accounts.delegate.address
    );

    caver.klay.accounts.wallet.create(limit);
    for (let i = 0; i < limit; i++) {
        console.log(`==================================== ${i}'th Iteration ====================================`);
        // select from db
        let query = `SELECT ipfs_cid FROM brdaily_uploaded_log WHERE brdaily_idx=${INITIAL_TO_BE_INSERTED_IDX + i}`
        let result = await schemaLog.query(query);
        let ipfs_cid = result[0].ipfs_cid;
        let multihash = helper.ipfsHashToMultihash(ipfs_cid);

        let dataSet = {
            idx: INITIAL_TO_BE_INSERTED_IDX + i,
            wafBlackIpHash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size    
        }
        let encodedDataSet = helper.encodeDataSet(dataSet);

        let key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        let account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }

        let abiAddWhiteList = 
            whiteList.methods.addWhiteList(
                account.address
            ).encodeABI();

        let receipt = await helper.feeDelegatedSmartContractExecute(
            vault.cypress.accounts.deployer.address,
            vault.cypress.accounts.deployer.privateKey,
            contract.addressOfWhiteList,
            vault.cypress.accounts.delegate,
            abiAddWhiteList
        );
        let whiteListTxHash = receipt.transactionHash;
        console.log(`whiteListTxHash: ${whiteListTxHash}`);

        let abiAddWafBlackIp = 
            cloudbricWafBlackIpStorage.methods.addWafBlackIp(
                encodedDataSet.encodedIdxWafBlackIpList, 
                encodedDataSet.encodedWafBlackIpHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI();

        // async batch
        receipt = await helper.feeDelegatedSmartContractExecute(
            account.address,
            account.privateKey,
            contract.addressOfWafBlackIpStorage,
            vault.cypress.accounts.delegate,
            abiAddWafBlackIp
        );
        let storageTxHash = receipt.transactionHash;
        console.log(`wafBlackIpTxHash: ${storageTxHash}`);
        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        // db update
        query = `UPDATE brdaily_uploaded_log \
        SET whitelist_contract_address='${contract.addressOfWhiteList}', \
        storage_contract_address='${contract.addressOfWafBlackIpStorage}', \
        whitelist_transaction_hash='${whiteListTxHash}', \
        storage_transaction_hash='${storageTxHash}', \
        klaytn_uploaded_date='${uploaded_date}', \
        from_address='${account.address}', \
        from_private_key='${account.address}' \
        WHERE brdaily_idx='${INITIAL_TO_BE_INSERTED_IDX + i}'`
        result = await schemaLog.query(query);
        console.log(`==================================== end of ${i}'th Iteration ====================================`);
    }
}

/*
async function scanDatabase() {
    let wafBlackIpListSize = await cloudbricWafBlackIpStorage.methods.wafBlackIpListSize().call();
    console.log(wafBlackIpListSize);

    for (let i = 0; i < wafBlackIpListSize; i++) {
        let wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtIndex(i).call();
        console.log(wafBlackIp.hash);
    }
}
*/

addWafBalckIpBatch(1000);
//createAccount(300);