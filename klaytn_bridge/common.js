const constant = require(`${__dirname}/../config/constant`);
const dbPromiseInterface = require(`${__dirname}/../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

/**
 * get starting point of brdaily index at WhiteList standards.
 * @return {Number} startingBrdailyIndex
 */
async function getWhiteListStartingBrdailyIndex () {
    const query = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    const result = await schemaLog.query(query);
    const startingBrdailyIndex = result[0].brdaily_idx;

    return parseInt(startingBrdailyIndex);
}

/**
 * get index of the rows that should be inserted at WhiteList standards.
 * @return {Array} brdailyIdxList 
 */
async function getWhiteListAddIndexList() {
    const getBrdailyIdxList =
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NULL \
        ORDER BY brdaily_idx ASC LIMIT ${constant.WORKLOAD}`
    const rows = await schemaLog.query(getBrdailyIdxList);
    let brdailyIdxList = [];
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx);
    });
    return brdailyIdxList;
}

/**
 * get starting point of brdaily index at CloudbricWafBlackIpStorage standards.
 * @return {Number} lastInsertedBrdailyIndx
 */
async function getWafBlackIpStartingBrdailyIndex () {
    const query = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    const result = await schemaLog.query(query);
    const lastInsertedBrdailyIndex = result[0].brdaily_idx;

    return parseInt(lastInsertedBrdailyIndex);
}

/**
 * get index of the rows that should be inserted at CloudbricWafBlackIpStorage standards.
 * @return {Array} brdailyIdxList
 */
async function getWafBlackIpAddIndexList() {
    const getBrdailyIdxList =
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC LIMIT ${constant.WORKLOAD}`
    const rows = await schemaLog.query(getBrdailyIdxList);
    let brdailyIdxList = [];
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx);
    });
    return brdailyIdxList;
}

module.exports = {
    getWhiteListStartingBrdailyIndex: getWhiteListStartingBrdailyIndex,
    getWhiteListAddIndexList: getWhiteListAddIndexList,
    getWafBlackIpStartingBrdailyIndex: getWafBlackIpStartingBrdailyIndex,
    getWafBlackIpAddIndexList: getWafBlackIpAddIndexList
}