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
        ORDER BY brdaily_idx ASC LIMIT ${constant.WORKLOAD.WAF_BLACK_IP}`
    const rows = await schemaLog.query(getBrdailyIdxList);
    let brdailyIdxList = [];
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx);
    });
    return brdailyIdxList;
}

/**
 * get index of the rows that should be inserted at CloudbricHackerWalletStorage standards.
 * @return {Array} hackerWalletIdxList
 */
async function getHackerWalletAddIndexList() {
    const getHackerWalletIdxList =
        `SELECT idx FROM hacker_wallet_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY idx ASC LIMIT ${constant.WORKLOAD.THREAT_DB}`
    const rows = await schemaLog.query(getHackerWalletIdxList);
    let hackerWalletIdxList = [];
    rows.forEach(row => {
        hackerWalletIdxList.push(row.idx);
    });
    return hackerWalletIdxList;
}

async function getPhishingUrlAddIndexList() {
    const getPhishingUrlIdxList =
    `SELECT idx FROM phishing_url_uploaded_log \
    WHERE storage_transaction_hash IS NULL \
    AND whitelist_transaction_hash IS NOT NULL \
    ORDER BY idx ASC LIMIT ${constant.WORKLOAD.THREAT_DB}`
    const rows = await schemaLog.query(getPhishingUrlIdxList);
    let phishingUrlIdxList = [];
    rows.forEach(row => {
        phishingUrlIdxList.push(row.idx);
    });
    return phishingUrlIdxList;
}

module.exports = {
    getWhiteListStartingBrdailyIndex: getWhiteListStartingBrdailyIndex,
    getWhiteListAddIndexList: getWhiteListAddIndexList,
    getHackerWalletAddIndexList: getHackerWalletAddIndexList,
    getPhishingUrlAddIndexList: getPhishingUrlAddIndexList
}