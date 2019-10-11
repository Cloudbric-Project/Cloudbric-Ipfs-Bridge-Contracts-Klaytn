const dbPromiseInterface = require(`../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

/**
 * get brdaily_idx which would be a starting point to insert black ip data.
 * @return {Number} startBrdailyIndex
 */
async function getWhiteListAddStartingBrdailyIndex () {
    const getStartBrdailyIdxQuery = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    const result = await schemaLog.query(getStartBrdailyIdxQuery);
    const startBrdailyIndex = result[0].brdaily_idx;

    return parseInt(startBrdailyIndex);
}

/**
 * get brdaily_idx which would be a starting point to insert black ip data.
 * @return {Number} startBrdailyIndex
 */
async function getBlackIpAddStartingBrdailyIndex () {
    const getStartBrdailyIdxQuery = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    const result = await schemaLog.query(getStartBrdailyIdxQuery);
    const startBrdailyIndex = result[0].brdaily_idx;

    return parseInt(startBrdailyIndex);
}
async function getBlackIpAddIndexList() {
    const getBrdailyIdxList =
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC`
    const rows = await schemaLog.query(getBrdailyIdxList);
    let brdailyIdxList = [];
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx);
    });
    return brdailyIdxList;
}

// 어떤 brdaily_idx로 실행할지 리스트업
async function getWhiteListAddIndexList() {
    const getBrdailyIdxList =
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NULL \
        ORDER BY brdaily_idx ASC`
    const rows = await schemaLog.query(getBrdailyIdxList);
    let brdailyIdxList = [];
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx);
    });
    return brdailyIdxList;
}
getBlackIpAddIndexList();
module.exports = {
    getWhiteListAddStartingBrdailyIndex: getWhiteListAddStartingBrdailyIndex,
    getBlackIpAddStartingBrdailyIndex: getBlackIpAddStartingBrdailyIndex,
    getBlackIpAddIndexList: getBlackIpAddIndexList,
    getWhiteListAddIndexList: getWhiteListAddIndexList
}