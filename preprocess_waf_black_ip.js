const fs = require('fs');
const constant = require(`${__dirname}/config/constant`);
const dbPromiseInterface = require(`${__dirname}/db/db_promise`);
const schemaBr = new dbPromiseInterface('br');
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `${__dirname}/data/waf_black_ip`;
const pushq = require(`${__dirname}/helper/pushq`);

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
        message = 
            `[Klaytn]: failed to fetch brdaily rows
            from ${process.argv[0]}
            Let's try: node ${process.argv[0]} in shell to find bugs.`;
        pushq.sendMessage(message);
        throw(error);
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
            message = 
                `[Klaytn]: failed to convert brdaily row to JSON 
                from ${process.argv[0]}
                Let's try: node ${process.argv[0]} in shell to find bugs.`;
            pushq.sendMessage(message);
            throw(error);
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
        message = 
            `[Klaytn]: failed to query to Labs DB
            from ${process.argv[0]}
            Let's try: node ${process.argv[0]} in shell to find bugs.`;
        pushq.sendMessage(message);
        console.log(error);
    }
    const size = constant.WORKLOAD;

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