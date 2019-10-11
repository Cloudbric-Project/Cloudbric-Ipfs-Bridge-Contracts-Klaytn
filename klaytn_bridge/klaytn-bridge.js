// THIS SOURCE CODE WILL BE REMOVED SOON...
const fs = require('fs');
const path = require('path');
const appDir = path.dirname('index.js');
const caverConfig = require(`${appDir}/config/caver`);
const contract = require(`${appDir}/config/contract`);
const helper = require(`${appDir}/helper/helper`);
const dbPromiseInterface = require(`${appDir}/db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

const vault = caverConfig.vault;
const caver = caverConfig.caver;
const whiteList = contract.whiteList;
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage;

async function addWafBlackIpBatch() {
    const args = process.argv.slice(2);
    const INITIAL_TO_BE_INSERTED_IDX = parseInt(args[0]);
    const limit = parseInt(args[1]);

    console.log(args);
    if (INITIAL_TO_BE_INSERTED_IDX < 210513986) {
        console.log(`YOU MUST CHECK THE ARGUMENT... ${INITIAL_TO_BE_INSERTED_IDX}`);
        process.exit(1);
    }

    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address);
    await caver.klay.accounts.wallet.create(limit);

    for (let i = 0; i < limit; i++) {
        console.log(`${i}'th Iteration ++++++++++++++++++++++++++++++++++++++`); 
        // select from db and encode data
        let selectCidQuery = `SELECT ipfs_cid FROM brdaily_uploaded_log WHERE brdaily_idx=${INITIAL_TO_BE_INSERTED_IDX + i}`
        console.log(selectCidQuery);
        let cidResult = await schemaLog.query(selectCidQuery);
        console.log(cidResult);

        let ipfsCid = cidResult[0].ipfs_cid;
        let multihash = helper.ipfsHashToMultihash(ipfsCid);

        console.log("CREATE DATA SET...");
        let dataSet = {
            clbIndex: INITIAL_TO_BE_INSERTED_IDX + i,
            wafBlackIpHash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size    
        }
        let encodedDataSet = helper.encodeDataSet(dataSet);

        console.log(encodedDataSet);

        console.log("CREATE ACCOUNT...");
        let key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        let account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }
        console.log(`address: ${account.address}`);
        console.log(`privateKey: ${account.privateKey}`);

        let abiAddWhiteList = 
            whiteList.methods.addWhiteList(
                account.address
            ).encodeABI();

        // only deployer can add user to whitelist
        let receipt = await helper.feeDelegatedSmartContractExecute(
            vault.cypress.accounts.deployer.address,
            vault.cypress.accounts.deployer.privateKey,
            whiteList._address,
            feePayer,
            abiAddWhiteList
        );
        let whiteListTxHash = receipt.transactionHash;
        console.log(`whiteListTxHash: ${whiteListTxHash}`);

        let abiAddWafBlackIp = 
            cloudbricWafBlackIpStorage.methods.addWafBlackIp(
                encodedDataSet.encodedClbIndex, 
                encodedDataSet.encodedWafBlackIpHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI();
        
        receipt = await helper.feeDelegatedSmartContractExecute(
            account.address,
            account.privateKey,
            cloudbricWafBlackIpStorage._address,
            feePayer,
            abiAddWafBlackIp
        );
        let storageTxHash = receipt.transactionHash;
        console.log(`cloudbricWafBlackIpTxHash: ${storageTxHash}`);
        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        console.log("DB UPDATE EXECUTE...");
        let checkQuery = `SELECT klaytn_uploaded_date, ipfs_cid FROM brdaily_uploaded_log WHERE brdaily_idx=${INITIAL_TO_BE_INSERTED_IDX + i}`
        let checkResult = await schemaLog.query(checkQuery);
        const klaytn_uploaded_date = checkResult[0].klaytn_uploaded_date;
        if (klaytn_uploaded_date != null) {
            console.log(`${INITIAL_TO_BE_INSERTED_IDX + i} is already has data, so it must not be updated.`);
            process.exit(1);
        }

        let updateQuery = `UPDATE brdaily_uploaded_log \
        SET whitelist_contract_address='${contract.addressOfWhiteList}', \
        storage_contract_address='${contract.addressOfWafBlackIpStorage}', \
        whitelist_transaction_hash='${whiteListTxHash}', \
        storage_transaction_hash='${storageTxHash}', \
        klaytn_uploaded_date='${uploaded_date}', \
        from_address='${account.address}', \
        from_private_key='${account.privateKey}' \
        WHERE brdaily_idx='${INITIAL_TO_BE_INSERTED_IDX + i}'`
        let updateResult = await schemaLog.query(updateQuery);
        console.log(`${i}'th Iteration --------------------------------------`); 
    }
}

async function addWafBlackIp() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address);
    await caver.klay.accounts.wallet.create(1);
    // select from db and encode data
    let ipfsCid = 'QmUeDhDbSc1cRjDdjMWjhdLpEXjYVs2aTNKtu4N3E4jgkA';
    let multihash = helper.ipfsHashToMultihash(ipfsCid);

    console.log("multihash...");
    console.log(multihash);

    const clbIndex = '210513985';
    let dataSet = {
        clbIndex: clbIndex,
        wafBlackIpHash: multihash.hash,
        hashFunction: multihash.hashFunction,
        size: multihash.size    
    }
    let encodedDataSet = helper.encodeDataSet(dataSet);

    let key = caver.klay.accounts.wallet.getKlaytnWalletKey(1);
    let account = {
        "address": key.slice(70,140),
        "privateKey": key.slice(0,66)
    }

    let abiAddWhiteList = 
        whiteList.methods.addWhiteList(
            account.address
        ).encodeABI();

    // only deployer can add user to whitelist
    let receipt = await helper.feeDelegatedSmartContractExecute(
        vault.cypress.accounts.deployer.address,
        vault.cypress.accounts.deployer.privateKey,
        whiteList._address,
        feePayer,
        abiAddWhiteList
    );
    let whiteListTxHash = receipt.transactionHash;
    console.log(`whiteListTxHash: ${whiteListTxHash}`);

    let abiAddWafBlackIp = 
        cloudbricWafBlackIpStorage.methods.addWafBlackIp(
            encodedDataSet.encodedClbIndex, 
            encodedDataSet.encodedWafBlackIpHash, 
            encodedDataSet.encodedHashFunction, 
            encodedDataSet.encodedSize
        ).encodeABI();
    
    receipt = await helper.feeDelegatedSmartContractExecute(
        account.address,
        account.privateKey,
        cloudbricWafBlackIpStorage._address,
        feePayer,
        abiAddWafBlackIp
    );
    let storageTxHash = receipt.transactionHash;
    console.log(`cloudbricWafBlackIpTxHash: ${storageTxHash}`);
    let uploaded_date = new Date().toISOString(); // UTC format
    uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

    // db update
    // before update check if that row existed.
    query = `UPDATE brdaily_uploaded_log \
    SET whitelist_contract_address='${contract.addressOfWhiteList}', \
    storage_contract_address='${contract.addressOfWafBlackIpStorage}', \
    whitelist_transaction_hash='${whiteListTxHash}', \
    storage_transaction_hash='${storageTxHash}', \
    klaytn_uploaded_date='${uploaded_date}', \
    from_address='${account.address}', \
    from_private_key='${account.privateKey}' \
    WHERE brdaily_idx='${clbIndex}'`
    result = await schemaLog.query(query);
}


async function scanDatabase() {
    let wafBlackIpListSize = await cloudbricWafBlackIpStorage.methods.wafBlackIpListSize().call();
    console.log("wafBlackIpListSize:");
    console.log(wafBlackIpListSize);

    for (let i = 0; i < wafBlackIpListSize; i++) {
        let wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtIndex(i).call();
        console.log("wafBlackIp:");
        console.log(wafBlackIp);
    }
}

async function getWafBlackIpAtClbIndex(clbIndex) {
    let wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtClbIndex(
        helper.stringToBytes32(clbIndex)
    ).call();
    console.log(wafBlackIp)
}

async function test() {
}

addWafBlackIpBatch();
//createAccount(300);
//scanDatabase();
//addWafBlackIp();
//getWafBlackIpAtClbIndex('210512327');

//test();