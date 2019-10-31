const fs = require('fs');
const constant = require(`${__dirname}/../../config/constant`);
const dbPromiseInterface = require(`${__dirname}/../../db/db_promise`);
const schemaThreatdb = new dbPromiseInterface('threatdb');
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `${__dirname}/../../data/threatdb/hacker_wallet`;
const helper = require(`${__dirname}/../../helper/helper`);
const pushq = require(`${__dirname}/../../helper/pushq`);
const common = require(`${__dirname}/common`);

async function preprocess() {
    let rows = null;
    let startIdx = null;
    try {
        // before execute this main, you should check if orphan data is exists in data directory.
        // if so, you should execute failover logic.
        const getLastIdxQuery = "SELECT idx FROM hacker_wallet_uploaded_log ORDER BY idx DESC LIMIT 1";
        const result = await schemaLog.query(getLastIdxQuery);
        const lastIdx = result[0] == null ? 0 : result[0].idx;
        startIdx = lastIdx + 1;

        console.log(startIdx);
    } catch (error) { 
        const message = helper.createErrorMessage('query to Labs DB', __filename);
        pushq.sendMessage(message);
        throw new Error(error);
    }
    const size = constant.WORKLOAD.THREAT_DB;

    const fetchQueryFromStartingIdx = 
        `SELECT * FROM td_hacker_wallet_detail \
        WHERE idx >= ${startIdx} \
        ORDER BY idx ASC \
        LIMIT ${size}`;

    console.log(`GET ${size} ROWS(BEGIN WITH ${startIdx}) AND CONVERT IT TO JSON`);
    try {
        rows = await common.fetchRows(schemaThreatdb, fetchQueryFromStartingIdx);
        console.log(rows);
    } catch (error) {
        throw new Error(error);
    }
    try {
        await common.convertRowToJSON(rows, dataStorage);
    } catch (error) {
        const message = helper.createErrorMessage('fetch', __filename);
        pushq.sendMessage(message);
        throw new Error(error);
    }
    process.exit(1);
}
preprocess();