const fs = require('fs')
const path = require('path')
const APP_ROOT_DIR = path.join(__dirname)
const constant = require(path.join(APP_ROOT_DIR, 'config/constant'))
const cdbPromiseInterface = require(path.join(APP_ROOT_DIR, 'db/db_promise'))
const helper = require(path.join(APP_ROOT_DIR, 'helper/helper'))
const pushq = require(path.join(APP_ROOT_DIR, 'helper/pushq'))

const schemaBr = new dbPromiseInterface('br')
const schemaLog = new dbPromiseInterface('log')
const dataStorage = path.join(APP_ROOT_DIR, 'data/waf_black_ip')

/**
 * fetch rows from brdaily table from starting point(last inserted index + 1)
 * @param {String} query
 * @return {Array.<Object>} rows which contains row of threat data
 */
async function fetchRows(fetchQueryFromStartingIdx) {
    let rows = null;
    try {
        console.log(`fetch rows from start idx`);
        rows = await schemaBr.query(fetchQueryFromStartingIdx);
        return rows;
    } catch (error) {
        const message = helper.createErrorMessage('fetch rows from brdaily table', __filename);
        pushq.sendMessage(message);
        throw new Error(error);
    }
}

/**
 * convert each row to .json file in /data/waf_black_ip directory.
 * @param {Array.<Object>} rows which contains row of threat data
 */
async function convertRowToJSON(rows) {
    rows.forEach((row) => {
        let rowJsonString = JSON.stringify(row);
        let parsedRow = JSON.parse(rowJsonString);
        try {
            fs.writeFileSync(`${dataStorage}/${parsedRow.idx}.json`, rowJsonString);
        } catch (error) {
            const message = helper.createErrorMessage('convert brdaily row to JSON', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
    });
    console.log(`convert Row To JSON is ended`);
    return true;
}

async function main() {
    let rows = null;
    let startIdx = null;
    try {
        // before execute this main, you should check if orphan data is exists in data directory.
        // if so, you should execute failover logic.
        const getLastIdxQuery = "SELECT brdaily_idx FROM brdaily_uploaded_log ORDER BY brdaily_idx DESC LIMIT 1";
        const result = await schemaLog.query(getLastIdxQuery);
        const lastIdx = result[0].brdaily_idx;
        startIdx = lastIdx + 1;
    } catch (error) { 
        const message = helper.createErrorMessage('query to Labs DB', __filename);
        pushq.sendMessage(message);
        throw new Error(error);
    }
    const size = constant.WORKLOAD.WAF_BLACK_IP;

    const fetchQueryFromStartingIdx = 
        `SELECT * FROM brdaily \
        WHERE idx >= ${startIdx} \
        ORDER BY idx ASC \
        LIMIT ${size}`;

    console.log(`GET ${size} ROWS(BEGIN WITH ${startIdx}) AND CONVERT IT TO JSON`);
    try {
        rows = await fetchRows(fetchQueryFromStartingIdx);
    } catch (error) {
        throw new Error(error);
    }
    try {
        await convertRowToJSON(rows);
    } catch (error) {
        const message = helper.createErrorMessage('fetch', __filename);
        pushq.sendMessage(message);
        throw new Error(error);
    }
    process.exit(1);
}

(async function () {
    await main()
})()