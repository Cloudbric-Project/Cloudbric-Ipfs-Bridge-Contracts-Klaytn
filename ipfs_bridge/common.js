const constant = require(`${__dirname}/../config/constant`);
const dbPromiseInterface = require(`${__dirname}/../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

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
    getWafBlackIpAddIndexList: getWafBlackIpAddIndexList
}