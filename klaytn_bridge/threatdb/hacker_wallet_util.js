const dateFormat = require('dateformat');
const caverConfig = require(`${__dirname}/../../config/caver`);
const contract = require(`${__dirname}/../../config/contract`); 
const helper = require(`${__dirname}/../../helper/helper`);
const pushq = require(`${__dirname}/../../helper/pushq`);
const colorBoard = require(`${__dirname}/../../helper/color`);
const common = require(`${__dirname}/../common`);
const dbPromiseInterface = require(`${__dirname}/../../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

const vault = caverConfig.vault;
const caver = caverConfig.caver;
const cloudbricHackerWalletStorage = contract.cloudbricHackerWalletStorage;

async function addHackerWallet() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    );
    const hackerWalletIdxList = await common.getHackerWalletAddIndexList();
    const length = hackerWalletIdxList.length;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayYmd = dateFormat(now, "UTC:yyyy-mm-dd");
    const tomorrowYmd = dateFormat(tomorrow, "UTC:yyyy-mm-dd");

    const getWorkQuoteQuery = `SELECT COUNT(*) FROM hackerWallet_uploaded_log 
        WHERE storage_transaction_hash IS NULL 
        AND whitelist_uploaded_date >= '${todayYmd}' 
        AND whitelist_uploaded_date < '${tomorrowYmd}'`;
   
    let workQuote = 0;
    try {
        const result = await schemaLog.query(getWorkQuoteQuery);
        workQuote = result[0]['COUNT(*)'] - 1;
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
        
    console.log(`${colorBoard.FgWhite}Start... from ${hackerWalletIdxList[0]} to ${hackerWalletIdxList[length - 1]}`);
    for (let i = 0; i < length; i++) {
        if (i >= workQuote) {
            break;
        }
        console.log(`${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++${colorBoard.FgWhite}${i}'th Iteration ${hackerWalletIdxList[i]} / ${colorBoard.FgRed}${hackerWalletIdxList[length - 1]}${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++`); 
        // select from db and encode data
        const selectCidQuery = `SELECT ipfs_cid, from_address, from_private_key FROM hacker_wallet_uploaded_log WHERE hacker_wallet_detail_idx=${hackerWalletIdxList[i]}`
        console.log(`${colorBoard.FgWhite}selectCidQuery`);
        const cidResult = await schemaLog.query(selectCidQuery);
        console.log(cidResult);

        const ipfsCid = cidResult[0].ipfs_cid;
        const address = cidResult[0].from_address;
        const privateKey = cidResult[0].from_private_key; 

        if (ipfsCid == null || address == null || privateKey == null) {
            `None matching data with hackerWallet_idx: ${hackerWalletIdxList[i]}`
            console.log("Somethings going wrong... It should be existed");
            process.exit(1);
        }

        const multihash = helper.ipfsHashToMultihash(ipfsCid);

        const dataSet = {
            clbIndex: hackerWalletIdxList[i],
            hash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size    
        }
        const encodedDataSet = helper.encodeDataSet(dataSet);
        console.log(encodedDataSet);

        const abiAddHackerWallet = 
            cloudbricHackerWalletStorage.methods.addHackerWallet(
                encodedDataSet.encodedClbIndex, 
                encodedDataSet.encodedHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI();
       
        console.log(`${colorBoard.FgWhite}addHackerWallet Transaction Execute...`);
        let receipt = null;
        try {
            receipt = await helper.feeDelegatedSmartContractExecute(
                address,
                privateKey,
                cloudbricHackerWalletStorage._address,
                feePayer,
                abiAddHackerWallet
            );
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        
        const hackerWalletStorageTxHash = receipt.transactionHash;
        console.log(`${colorBoard.FgWhite}cloudbricHackerWalletTxHash: ${colorBoard.FgYellow}${hackerWalletStorageTxHash}`);

        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        const updateQuery = `UPDATE hackerWallet_uploaded_log \
            SET storage_contract_address='${cloudbricHackerWalletStorage._address}', \
            storage_transaction_hash='${hackerWalletStorageTxHash}', \
            hacker_wallet_uploaded_date='${uploaded_date}' \
            WHERE hackerWallet_idx='${hackerWalletIdxList[i]}'`

        try {
            await schemaLog.query(updateQuery);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(`${colorBoard.FgRed}--------------------------------------${colorBoard.FgWhite}${i}'th Iteration ${length - i + 1} remained.${colorBoard.FgRed}--------------------------------------${colorBoard.FgWhite}`); 
    }
    process.exit(1);
}

async function scanHackerWalletStorage() {
    let hackerWalletListSize = await cloudbricHackerWalletStorage.methods.hackerWalletListSize().call();
    console.log("hackerWalletListSize:");
    console.log(hackerWalletListSize);

    for (let i = 0; i < hackerWalletListSize; i++) {
        console.log(`${i}'th Iteration ++++++++++++++++++++++++++++++++++++++`); 
        let hackerWallet = await cloudbricHackerWalletStorage.methods.getHackerWalletAtIndex(i).call();
        console.log("hackerWallet:");
        console.log(hackerWallet);
        console.log(`${i}'th Iteration --------------------------------------`); 
   }
}

async function getHackerWalletAtClbIndex(clbIndex) {
    let hackerWallet = await cloudbricHackerWalletStorage.methods.getHackerWalletAtClbIndex(
        helper.stringToBytes32(clbIndex)
    ).call();
    console.log(hackerWallet)
}

module.exports = {
    addHackerWalletUsingList: addHackerWalletUsingList,
    scanHackerWalletStorage: scanHackerWalletStorage,
    getHackerWalletAtClbIndex: getHackerWalletAtClbIndex
}