const fs = require('fs');
const readLastLines = require('read-last-lines');
const caverConfig = require(`${__dirname}/../config/caver`);
const contract = require(`${__dirname}/../config/contract`); 
const helper = require(`${__dirname}/../helper/helper`);
const colorBoard = require(`${__dirname}/../helper/color`);
const common = require(`${__dirname}/common`);
const dbPromiseInterface = require(`${__dirname}/../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

const vault = caverConfig.vault;
const caver = caverConfig.caver;
const whiteList = contract.whiteList;

async function addWhiteList(address, feePayer) {
    let abiAddWhiteList = 
        whiteList.methods.addWhiteList(
            address
        ).encodeABI();

    // only deployer can add user to whitelist
    try {
        const receipt = await helper.feeDelegatedSmartContractExecute(
            vault.cypress.accounts.deployer.address,
            vault.cypress.accounts.deployer.privateKey,
            whiteList._address,
            feePayer,
            abiAddWhiteList
        );
        return receipt;
    } catch (error) {
        throw error;
    }
}

async function addWhiteListUsingList() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    );
    const brdailyIdxList = await common.getWhiteListAddIndexList();
    const length = brdailyIdxList.length;

    console.log("CREATE ACCOUNT...");
    await caver.klay.accounts.wallet.create(length);

    for (let i = 0; i < brdailyIdxList.length; i++) {
        console.log(`${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++${colorBoard.FgWhite}${i}'th Iteration ${brdailyIdxList[i]} / ${colorBoard.FgRed}${brdailyIdxList[length - 1]}${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++`); 
        const key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        const account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }
        console.log(`${colorBoard.FgWhite}address: ${colorBoard.FgCyan} ${account.address}`);
        console.log(`${colorBoard.FgWhite}privateKey: ${colorBoard.FgCyan} ${account.privateKey}`);

        let receipt = null;
        try {
            receipt = await addWhiteList(account.address, feePayer);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }

        const whiteListTxHash = receipt.transactionHash;
        console.log(`${colorBoard.FgWhite}whiteListTxHash: ${colorBoard.FgYellow} ${whiteListTxHash}`);

        let uploadedDate = new Date().toISOString(); // UTC format
        uploadedDate = uploadedDate.replace(/T/, ' ').replace(/\..+/, '');

        const updateQuery = 
            `UPDATE brdaily_uploaded_log \
            SET whitelist_contract_address='${whiteList._address}', \
            whitelist_transaction_hash='${whiteListTxHash}', \
            whitelist_uploaded_date='${uploadedDate}', \
            from_address='${account.address}', \
            from_private_key='${account.privateKey}' \
            WHERE brdaily_idx='${brdailyIdxList[i]}'`;

        try {
            await schemaLog.query(updateQuery);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(`${colorBoard.FgRed}--------------------------------------${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgRed}--------------------------------------`); 
    }
}

async function addWhiteListWorker() {
    const worker = process.argv[2];
    const directoryPath = `${__dirname}/../work`;
    
    const rawdata = readLastLines.read(`${directoryPath}/white_list_worker_${worker}.json`);
    const workQuota = JSON.parse(rawdata);
    
    for (let i = workQuota.from; i < workQuota.to; i++) {
        const currentBrdailyIndex = workQuota.brdailyIdxList;

    }
    

}

addWhiteListUsingList();