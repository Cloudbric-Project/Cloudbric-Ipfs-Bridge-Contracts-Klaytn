const fs = require('fs');
const dbPromiseInterface = require(`./db/db_promise`);
const schemaBr = new dbPromiseInterface('br');
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `./data/waf_black_ip`;
const pushq = require(`./helper/pushq`);

/**
 * 
 * @param {String} query which fetch from brdaily table from starting point(last inserted index + 1)
 * @return {Array.<Object>} rows
 */
async function fetchRows(fetchQueryFromStartingIdx) {
    let rows = null;
    try {
        rows = await schemaBr.query(fetchQueryFromStartingIdx);
        return rows;
    } catch (error) {
        pushq.sendMessage(`cloudbric', '[TEST] error fetch row from ${startIdx}`);
        throw(error);
    }
}

async function convertRowToJSON(rows) {
    rows.forEach((row) => {
        let rowJsonString = JSON.stringify(row);
        let parsedRow = JSON.parse(rowJsonString);
        try {
            fs.writeFileSync(`${dataStorage}/${parsedRow.idx}.json`, rowJsonString);
        } catch (error) {
            pushq.sendMessage(`cloudbric', '[TEST] error convert ${parsedRow.idx}'s row`);
            throw(error);
        }
    });
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
        console.log(error);
    }
    const size = 10000;

    const fetchQueryFromStartingIdx = 
        `SELECT * FROM brdaily \
        WHERE idx >= ${startIdx} \
        ORDER BY idx ASC \
        LIMIT ${size}`;

    console.log(`GET ${size} ROWS(BEGIN WITH ${startIdx}) AND CONVERT IT TO JSON`);
    try {
        rows = await fetchRows(fetchQueryFromStartingIdx);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
    try {
        await convertRowToJSON(rows);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
    process.exit(1);
}
main();