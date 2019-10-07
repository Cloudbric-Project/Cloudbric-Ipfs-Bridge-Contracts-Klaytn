const fs = require('fs');
const path = require('path');

// direcotry path setup
const appDir = path.dirname('index.js');

const labsdb = require(`${appDir}/db/labsdb`);
const br = new labsdb('br');
const dataStorage = `${appDir}/data/waf_black_ip`;

const logger = require(`${appDir}/helper/logger`);
const wafBlackIpLogger = logger.getLogger("wafBlackIp");

const queryBuilder = require(`${appDir}/private/.query_builder`);

const pushq = require(`${appDir}/helper/pushq`);

const INITIAL_INSERTED_IDX = '210511986';

// read log and get last inserted date
const lastInsertedIdx = INITIAL_INSERTED_IDX;
const fetchQuery = queryBuilder.getFetchQuery(lastInsertedIdx, 'brdaily', 100);

async function fetchRows(query) {
    let rows = null;
    try {
        rows = await br.query(query);
        message = logger.getLoggerFormat(
            "SUCCESS",
            {
                "TABLE": "brdaily",
                "FETCH_LENGTH": rows.length,
                "FROM_IDX": lastInsertedIdx
            },
            `GET ${rows.length} ROWS FROM brdaily`
        );
        wafBlackIpLogger.fetch.debug(message);
        return rows;
    } catch (error) {
        message = logger.getLoggerFormat(
            "FAIL",
            {
                "TABLE": "brdaily",
                "FROM_IDX": lastInsertedIdx
            },
            `GET ${rows.length} ROWS FROM brdaily`
        );
        wafBlackIpLogger.fetch.error(message);
        await logger.shutdown();
        pushq.sendMessage(`cloudbric', '[TEST] error fetch row from ${lastInsertedIdx}`);
        throw(error);
    }
}

async function convertRowToJSON(rows) {
    rows.forEach((row) => {
        let rowJsonString = JSON.stringify(row);
        let parsedRow = JSON.parse(rowJsonString);
        try {
            fs.writeFileSync(`${dataStorage}/${parsedRow.idx}.json`, rowJsonString);
            message = logger.getLoggerFormat(
                "SUCCESS",
                {
                    "ROW": parsedRow.idx,
                },
                `CONVERT ${parsedRow.idx} ROWS FROM brdaily`
            );
            wafBlackIpLogger.convert.debug(message);
        } catch (error) {
            message = logger.getLoggerFormat(
                "FAIL",
                {
                    "ROW": parsedRow.idx,
                },
                `GET ${rows.length} ROWS FROM brdaily`
            );
            wafBlackIpLogger.convert.error(`convert ${parsedRow.idx}'s row to json [FAIL]`);
            pushq.sendMessage(`cloudbric', '[TEST] error convert ${parsedRow.idx}'s row`);
            throw(error);
        }
    });
    await logger.shutdown();
    return true;
}

async function test() {
    let rows = null;
    try {
        rows = await fetchRows(fetchQuery);
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
}
test();