
const fs = require('fs');
const path = require('path');
const dateTime = require('node-datetime');
const readLastLines = require('read-last-lines');

const appDir = path.dirname('index.js');

const wafLogStorage = `${appDir}/log/waf_black_ip`;
const blackIpLogStorage = `${appDir}/log/threatdb/black_ip`;
const hackerWalletLogStorage = `${appDir}/log/threatdb/hacker_wallet`;
const phishingUrlWalletLogStorage = `${appDir}/log/threatdb/phishing_url`;

async function getLastInsertedIdx() {
    let dt = dateTime.create();
    const todayYmd = dt.format('Y_m_d');

    dt.offsetInDays(-1);
    const yesterdayYmd = dt.format('Y_m_d');

    let logFilePath = `${wafLogStorage}/ipfs_upload/${todayYmd}.log`;
    try {
        if (fs.existsSync(logFilePath)) {
            // pass            
        } else {
            logFilePath = `${wafLogStorage}/ipfs_upload/${yesterdayYmd}.log`;
        }
    } catch (error) {
        throw error;
    }

    let lastLine = await readLastLines.read(logFilePath, 1);
    const jsonString = lastLine.slice(0, lastLine.length - 2); // remove whitespace and comma at the end of line.
    const jsonObj = JSON.parse(jsonString);
    return jsonObj['data'][0].metadata.IDX;
}

module.exports = {
    getLastInsertedIdx: getLastInsertedIdx
}