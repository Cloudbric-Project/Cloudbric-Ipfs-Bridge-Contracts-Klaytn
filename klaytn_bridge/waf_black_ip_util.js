const caverConfig = require(`${__dirname}/../config/caver`);
const contract = require(`${__dirname}/../config/contract`); 
const helper = require(`${__dirname}/../helper/helper`);
const colorBoard = require(`${__dirname}/../helper/color`);
const common = require(`${__dirname}/common`);
const dbPromiseInterface = require(`${__dirname}/../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');


const vault = caverConfig.vault;
const caver = caverConfig.caver;
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage;

async function addWafBlackIpBatchUsingList() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    );
    const brdailyIdxList = await common.getBlackIpAddIndexList();
    const length = brdailyIdxList.length;
        
    console.log(`${colorBoard.FgWhite}Start... from ${brdailyIdxList[0]} to ${brdailyIdxList[length - 1]}`);
    for (let i = 0; i < brdailyIdxList.length; i++) {
        console.log(`${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++${colorBoard.FgWhite}${i}'th Iteration ${brdailyIdxList[i]} / ${colorBoard.FgRed}${brdailyIdxList[length - 1]}${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++`); 
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

        const dataSet = {
            clbIndex: brdailyIdxList[i],
            wafBlackIpHash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size    
        }
        const encodedDataSet = helper.encodeDataSet(dataSet);
        console.log(`${colorBoard.FgWhite}`);
        console.log(encodedDataSet);

        const abiAddWafBlackIp = 
            cloudbricWafBlackIpStorage.methods.addWafBlackIp(
                encodedDataSet.encodedClbIndex, 
                encodedDataSet.encodedWafBlackIpHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI();
        
        console.log(`${colorBoard.FgWhite}addWafBlackIp Transaction Execute...`);
        let receipt = null;
        try {
            receipt = await helper.feeDelegatedSmartContractExecute(
                address,
                privateKey,
                cloudbricWafBlackIpStorage._address,
                feePayer,
                abiAddWafBlackIp
            );
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        
        const wafBlackIpStorageTxHash = receipt.transactionHash;
        console.log(`${colorBoard.FgWhite}cloudbricWafBlackIpTxHash: ${colorBoard.FgYellow}${wafBlackIpStorageTxHash}`);

        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        const updateQuery = `UPDATE brdaily_uploaded_log \
            SET storage_contract_address='${cloudbricWafBlackIpStorage._address}', \
            storage_transaction_hash='${wafBlackIpStorageTxHash}', \
            waf_black_ip_uploaded_date='${uploaded_date}' \
            WHERE brdaily_idx='${brdailyIdxList[i]}'`

        try {
            await schemaLog.query(updateQuery);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(`${colorBoard.FgRed}--------------------------------------${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgRed}--------------------------------------`); 
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