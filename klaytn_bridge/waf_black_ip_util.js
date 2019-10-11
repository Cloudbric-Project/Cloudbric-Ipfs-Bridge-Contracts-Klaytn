const caverConfig = require(`../config/caver`);
const contract = require(`../config/contract`); 
const helper = require(`../helper/helper`);
const colorBoard = require('../helper/color');
const common = require(`../klaytn_bridge/common`);
const dbPromiseInterface = require(`../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

const vault = caverConfig.vault;
const caver = caverConfig.caver;
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage;

// 중간에 빠진 데이터들도 커버 쳐야 한다.
async function addWafBlackIpBatch() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    );
    console.log("addWhiteListBatch START...");
    const args = process.argv.slice(2);
    // not even start must get last index automatically.
    const INITIAL_TO_BE_INSERTED_IDX = await common.getBlackIpAddStartingBrdailyIndex();
    const LIMIT = parseInt(args[0]);
    const SHOULD_BE_INSERTED_LAST_IDX = INITIAL_TO_BE_INSERTED_IDX + LIMIT - 1;

    console.log(`INITIAL_TO_BE_INSERTED_IDX: ${INITIAL_TO_BE_INSERTED_IDX}`);
    console.log(`SHOULD_BE_INSERTED_LAST_IDX: ${SHOULD_BE_INSERTED_LAST_IDX}`);

    if (INITIAL_TO_BE_INSERTED_IDX < 210513986) {
        console.log(`YOU MUST CHECK THE ARGUMENT... ${INITIAL_TO_BE_INSERTED_IDX}`);
        process.exit(1);
    }

    for (let i = 0; i < LIMIT; i++) {
        console.log(`${i}'th Iteration ++++++++++++++++++++++++++++++++++++++`); 
        // select from db and encode data
        const selectCidQuery = `SELECT ipfs_cid, from_address, from_private_key FROM brdaily_uploaded_log WHERE brdaily_idx=${INITIAL_TO_BE_INSERTED_IDX + i}`
        console.log(selectCidQuery);
        const cidResult = await schemaLog.query(selectCidQuery);
        console.log(cidResult);

        const ipfsCid = cidResult[0].ipfs_cid;
        const address = cidResult[0].from_address;
        const privateKey = cidResult[0].from_private_key; 

        if (ipfsCid == null || address == null || privateKey == null) {
            console.log("Somethings going wrong... It should be existed");
            process.exit(1);
        }

        const multihash = helper.ipfsHashToMultihash(ipfsCid);

        console.log("CREATE DATA SET...");
        const dataSet = {
            clbIndex: INITIAL_TO_BE_INSERTED_IDX + i,
            wafBlackIpHash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size    
        }
        const encodedDataSet = helper.encodeDataSet(dataSet);
        console.log(encodedDataSet);

        const abiAddWafBlackIp = 
            cloudbricWafBlackIpStorage.methods.addWafBlackIp(
                encodedDataSet.encodedClbIndex, 
                encodedDataSet.encodedWafBlackIpHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI();
        
        const receipt = await helper.feeDelegatedSmartContractExecute(
            address,
            privateKey,
            cloudbricWafBlackIpStorage._address,
            feePayer,
            abiAddWafBlackIp
        );
        const wafBlackIpStorageTxHash = receipt.transactionHash;
        console.log(`cloudbricWafBlackIpTxHash: ${wafBlackIpStorageTxHash}`);

        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        console.log("DB UPDATE EXECUTE...");
        const updateQuery = `UPDATE brdaily_uploaded_log \
            SET storage_contract_address='${cloudbricWafBlackIpStorage._address}', \
            storage_transaction_hash='${wafBlackIpStorageTxHash}', \
            waf_black_ip_uploaded_date='${uploaded_date}' \
            WHERE brdaily_idx='${INITIAL_TO_BE_INSERTED_IDX + i}'`
        const updateResult = await schemaLog.query(updateQuery);
        console.log(`${i}'th Iteration --------------------------------------`); 
    }
}

async function addWafBlackIpBatchUsingList() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    );
    const brdailyIdxList = await common.getBlackIpAddIndexList();
        
    console.log(`${colorBoard.FgWhite}Start... from ${brdailyIdxList[0]} to ${brdailyIdxList[brdailyIdxList.length - 1]}`);
    for (let i = 0; i < brdailyIdxList.length; i++) {
        console.log(`${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++`); 
        // select from db and encode data
        const selectCidQuery = `SELECT ipfs_cid, from_address, from_private_key FROM brdaily_uploaded_log WHERE brdaily_idx=${brdailyIdxList[i]}`
        console.log(`${colorBoard.FgWhite}selectCidQuery`);
        const cidResult = await schemaLog.query(selectCidQuery);
        console.log(cidResult);

        const ipfsCid = cidResult[0].ipfs_cid;
        const address = cidResult[0].from_address;
        const privateKey = cidResult[0].from_private_key; 

        if (ipfsCid == null || address == null || privateKey == null) {
            console.log("Somethings going wrong... It should be existed");
            process.exit(1);
        }

        const multihash = helper.ipfsHashToMultihash(ipfsCid);

        console.log(`${colorBoard.FgWhite}CREATE DATA SET...`);
        const dataSet = {
            clbIndex: brdailyIdxList[i],
            wafBlackIpHash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size    
        }
        const encodedDataSet = helper.encodeDataSet(dataSet);
        console.log(`${colorBoard.FgWhite}${encodedDataSet}`);

        const abiAddWafBlackIp = 
            cloudbricWafBlackIpStorage.methods.addWafBlackIp(
                encodedDataSet.encodedClbIndex, 
                encodedDataSet.encodedWafBlackIpHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI();
        
        console.log(`${colorBoard.FgWhite}addWafBlackIp Transaction Execute...`);
        const receipt = await helper.feeDelegatedSmartContractExecute(
            address,
            privateKey,
            cloudbricWafBlackIpStorage._address,
            feePayer,
            abiAddWafBlackIp
        );
        const wafBlackIpStorageTxHash = receipt.transactionHash;
        console.log(`${colorBoard.FgWhite}cloudbricWafBlackIpTxHash: ${colorBoard.FgYellow}${wafBlackIpStorageTxHash}`);

        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        const updateQuery = `UPDATE brdaily_uploaded_log \
            SET storage_contract_address='${cloudbricWafBlackIpStorage._address}', \
            storage_transaction_hash='${wafBlackIpStorageTxHash}', \
            waf_black_ip_uploaded_date='${uploaded_date}' \
            WHERE brdaily_idx='${brdailyIdxList[i]}'`
        console.log(`${colorBoard.FgWhite}${updateQuery}`);
        const updateResult = await schemaLog.query(updateQuery);
        console.log(`${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgRed}--------------------------------------`); 
    }
}

async function scanWafBlackIpStorage() {
    let wafBlackIpListSize = await cloudbricWafBlackIpStorage.methods.wafBlackIpListSize().call();
    console.log("wafBlackIpListSize:");
    console.log(wafBlackIpListSize);

    for (let i = 0; i < wafBlackIpListSize; i++) {
        console.log(`${i}'th Iteration ++++++++++++++++++++++++++++++++++++++`); 
        let wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtIndex(i).call();
        console.log("wafBlackIp:");
        console.log(wafBlackIp);
        console.log(`${i}'th Iteration --------------------------------------`); 
   }
}

async function getWafBlackIpAtClbIndex(clbIndex) {
    let wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtClbIndex(
        helper.stringToBytes32(clbIndex)
    ).call();
    console.log(wafBlackIp)
}

//addWafBlackIpBatch();
addWafBlackIpBatchUsingList();
//scanDatabase();
//getWafBlackIpAtClbIndex('210512327');