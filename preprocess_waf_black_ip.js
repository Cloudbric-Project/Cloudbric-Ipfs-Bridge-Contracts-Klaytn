const fs = require('fs');
const path = require('path');
const dateTime = require('node-datetime');
let log4js = require('log4js');

const labsdb = require('./db/labsdb');
const br = new labsdb('br');

// direcotry path setup
const appDir = path.dirname('index.js');
const dataStorage = `${appDir}/data/waf_black_ip`;
const logStorage = `${appDir}/log/waf_black_ip`

// log file name format
const dt = dateTime.create();
const todayYmd = dt.format('Y_m_d');

// configure logger
log4js.configure({
    appenders: {
        wafBlackIp: { 
            type: 'file', 
            filename: `${logStorage}/${todayYmd}.log`,
        pattern: `%d{yyyy/MM/dd-hh.mm} %p %c %m %n` } },
    categories: { default: { appenders: ['wafBlackIp'], level: 'debug' }}
})
const logger = log4js.getLogger('wafBlackIp');
// logger.debug('waf black ip shoud work correctly');

// 1. make result of query data to json file.
// 2. then upload file to ipfs.
// 3. write log db.

// read log and get last inserted date
const lastInsertedDate = '2019-03-31';

const limit = 100;
const selectQuery = 
    `SELECT * FROM brdaily \
    WHERE calculationDate >= ${lastInsertedDate} \
    ORDER BY calculationDate ASC \
    LIMIT ${limit}`

wafBlackIpToJSON = async () => {
    let rows = null;
    try {
        rows = await br.query(selectQuery);
        logger.debug(`[SUCCESS] get ${rows.length} rows from brdaily`);
    } catch (error) {
        console.log(error);
    }

    rows.forEach((row) => {
        let rowJsonString = JSON.stringify(row);
        let parsedRow = JSON.parse(rowJsonString);
        try { 
            fs.writeFileSync(`${dataStorage}/${parsedRow.idx}.json`, rowJsonString);
            logger.debug(`convert ${parsedRow.idx}'s row to json [OK]`);
        } catch (error) {
            console.log(error);
            logger.debug(`convert ${parsedRow.idx}'s row to json [FAIL]`);
            // pushq action
            process.exit();
        }
    });
}

fromJSONtoIpfs = async () => {
     
}
