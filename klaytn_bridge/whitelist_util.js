const readline = require('readline');
const caverConfig = require(`../config/caver`);
const contract = require(`../config/contract`); 
const helper = require(`../helper/helper`);
const colorBoard = require(`../helper/color`);
const common = require(`../klaytn_bridge/common`);
const dbPromiseInterface = require(`../db/db_promise`);
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

/**
 * batch function which add user account to white list.
 */
async function addWhiteListBatch() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address);
        console.log("addWhiteListBatch START..."
    );
    const args = process.argv.slice(2);
    const INITIAL_TO_BE_INSERTED_IDX = await common.getWhiteListAddStartingBrdailyIndex();
    const LIMIT = parseInt(args[0]);
    const SHOULD_BE_INSERTED_LAST_IDX = INITIAL_TO_BE_INSERTED_IDX + LIMIT - 1;

    console.log(`INITIAL_TO_BE_INSERTED_IDX: ${INITIAL_TO_BE_INSERTED_IDX}`);
    console.log(`SHOULD_BE_INSERTED_LAST_IDX: ${SHOULD_BE_INSERTED_LAST_IDX}`);

    if (INITIAL_TO_BE_INSERTED_IDX < 210513986) {
        console.log(`YOU MUST CHECK THE ARGUMENT... ${INITIAL_TO_BE_INSERTED_IDX}`);
        process.exit(1);
    }

    console.log("CREATE ACCOUNT...");
    await caver.klay.accounts.wallet.create(LIMIT);

    for (let i = 0; i < LIMIT; i++) {
        console.log(`${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++`); 
        let key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        let account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }
        console.log(`${colorBoard.FgWhite}address: ${colorBoard.FgCyan} ${account.address}`);
        console.log(`${colorBoard.FgWhite}privateKey: ${colorBoard.FgGreen} ${account.privateKey}`);

        console.log(`${colorBoard.FgWhite}addWhiteList Transaction Execute...`);
        const receipt = await addWhiteList(account.address, feePayer);

        const whiteListTxHash = receipt.transactionHash;
        console.log(`${colorBoard.FgWhite}whiteListTxHash: ${colorBoard.FgYellow} ${whiteListTxHash}`);

        let uploadedDate = new Date().toISOString(); // UTC format
        uploadedDate = uploadedDate.replace(/T/, ' ').replace(/\..+/, '');

        console.log(`${colorBoard.FgWhite}DB UPDATE EXECUTE...`);

        const updateQuery = 
            `UPDATE brdaily_uploaded_log \
            SET whitelist_contract_address='${contract.addressOfWhiteList}', \
            whitelist_transaction_hash='${whiteListTxHash}', \
            whitelist_uploaded_date='${uploadedDate}', \
            from_address='${account.address}', \
            from_private_key='${account.privateKey}' \
            WHERE brdaily_idx='${INITIAL_TO_BE_INSERTED_IDX + i}'`;

        try {
            await schemaLog.query(updateQuery);
        } catch (error) {
            throw error;
        }
        console.log(`${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgGreen}--------------------------------------`); 
    }
}

async function addWHiteListUsingList() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    );
    const brdailyIdxList = await common.getWhiteListAddIndexList();

    console.log("CREATE ACCOUNT...");
    await caver.klay.accounts.wallet.create(brdailyIdxList.length);

    for (let i = 0; i < brdailyIdxList.length; i++) {
        console.log(`${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgGreen}++++++++++++++++++++++++++++++++++++++`); 
        console.log(`${colorBoard.FgWhite}DO ABOUT brdilayidx ${colorBoard.FgGreen}${brdailyIdxList[i]}`);
        const key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        const account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }
        console.log(`${colorBoard.FgWhite}address: ${colorBoard.FgCyan} ${account.address}`);
        console.log(`${colorBoard.FgWhite}privateKey: ${colorBoard.FgGreen} ${account.privateKey}`);

        const receipt = await addWhiteList(account.address, feePayer);

        const whiteListTxHash = receipt.transactionHash;
        console.log(`${colorBoard.FgWhite}whiteListTxHash: ${colorBoard.FgYellow} ${whiteListTxHash}`);

        let uploadedDate = new Date().toISOString(); // UTC format
        uploadedDate = uploadedDate.replace(/T/, ' ').replace(/\..+/, '');

        console.log("DB UPDATE EXECUTE...");

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
            throw error;
        }
        console.log(`${colorBoard.FgWhite}${i}'th Iteration ${colorBoard.FgGreen}--------------------------------------`); 
    }
}

/**
 * need to be tested.
 * @param {*} INITIAL_TO_BE_INSERTED_IDX 
 * @param {*} SHOULD_BE_INSERTED_LAST_IDX 
 */
async function failover (INITIAL_TO_BE_INSERTED_IDX, SHOULD_BE_INSERTED_LAST_IDX) {
    console.log("failover START...");
    const feePayer = caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address);
        console.log("addWhiteListBatch START..."
    );
    let failedBrdailyIdxArray = [];
    // create failed brdaily_idx list.
    // NULL이라는 의미는 실패했다는 뜻이다.
    const getFailedListQuery = 
        `SELECT brdaily_idx \ 
        FROM brdaily_uploaded_log \
        WHERE whitelist_transaction_hash IS NULL \ 
        AND brdaily_idx >= ${INITIAL_TO_BE_INSERTED_IDX} \ 
        AND brdaily_idx <= ${SHOULD_BE_INSERTED_LAST_IDX}`;
    console.log(getFailedListQuery);
    let rows = null;
    try {
        // 실패했다면 로우가 존재할 것이다.
        rows = await schemaLog.query(getFailedListQuery);
    } catch (error) {
        throw error;
    }
    console.log(rows);
    // 모두 성공한 케이스이기 때문에 프로그램을 종료합니다.
    if (rows === undefined || rows.length == 0) {
        console.log("THERE IS NO ");
        process.exit(1);
    }

    // 각 실패한 케이스에 대하여 실패 케이스들의 brdaily_idx를 담는다.
    rows.forEach(row => {
        failedBrdailyIdxArray.push(row.brdaily_idx);
    });

    const failedListLength = failedBrdailyIdxArray.length;
    console.log(`create ${failedListLength} accounts`);
    await caver.klay.accounts.wallet.create(failedListLength);

    for (let i = 0; i < failedListLength; i++) {
        console.log(`${i}'th Iteration ++++++++++++++++++++++++++++++++++++++`);        
        // get address
        const brdailyIdx = failedBrdailyIdxArray[i];

        const key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1);
        const account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }
        const receipt = await addWhiteList(account.address);

        const whiteListTxHash = receipt.transactionHash;
        console.log(`whiteListTxHash: ${whiteListTxHash}`);

        let uploadedDate = new Date().toISOString(); // UTC format
        uploadedDate = uploadedDate.replace(/T/, ' ').replace(/\..+/, '');

        const updateQuery = 
            `UPDATE brdaily_uploaded_log \
            SET whitelist_contract_address='${contract.addressOfWhiteList}', \
            whitelist_transaction_hash='${whiteListTxHash}', \
            whitelist_uploaded_date='${uploadedDate}', \
            from_address='${account.address}', \
            from_private_key='${account.privateKey}' \
            WHERE brdaily_idx='${brdailyIdx}'`;
       
        console.log(updateQuery);
        try {
            await schemaLog.query(updateQuery);
        } catch (error) {
            throw error;
        }

        console.log(`${i}'th Iteration --------------------------------------`); 
    }
}

//addWhiteListBatch();
//failover(210514002, 210514006)
addWHiteListUsingList();