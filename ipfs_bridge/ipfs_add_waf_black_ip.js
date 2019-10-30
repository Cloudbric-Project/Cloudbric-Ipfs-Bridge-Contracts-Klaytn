const fs = require('fs');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/172.105.229.53/tcp/5001/'); 

// direcotry path setup
const dbPromiseInterface = require(`${__dirname}/../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `${__dirname}/../data/waf_black_ip`;
const helper = require(`${__dirname}/../helper/helper`);
const pushq = require(`${__dirname}/../helper/pushq`);

/**
 * write waf_black_ip data in /data/waf_black_ip/<brdaily_idx>.json format to IPFS.
 * also write log in the database table.
 */
async function ipfsAddWafBlackIp() {
    const failedList = fs.readdirSync(dataStorage);
    for (let i = 0; i < failedList.length; i++) {
        const fileName = `${dataStorage}/${failedList[i]}`
        const idx = failedList[i].slice(0, failedList[i].length - 5);

        const wafBlackIpJson = fs.readFileSync(fileName).toString();
        const bufferedWafBlackIp = Buffer.from(wafBlackIpJson);
        let result = null;
        let wafBlackIpAdded = null;

        try {
            result = await ipfs.add(bufferedWafBlackIp, {pin: true});
            wafBlackIpAdded = result[0];
        } catch (error) {
            const message = helper.createErrorMessage('add waf black ip data to IPFS', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
        console.log(`${idx} IS UPLOADED TO IPFS`);
        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        let stmt = `INSERT INTO brdaily_uploaded_log (brdaily_idx, ipfs_cid, ipfs_uploaded_date) VALUES(?,?,?)`;
        let values = [idx, wafBlackIpAdded.hash, uploaded_date];
        try {
            await schemaLog.query(stmt, values);
            console.log("INSERT DB SUCCESS");
            const multihash = helper.ipfsHashToMultihash(wafBlackIpAdded.hash);
            // delete uploaded file for storage issue.
            fs.unlinkSync(fileName);
        } catch (error) {
            const message = helper.createErrorMessage('inser into brdaily_uploaded_table', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
    }
    console.log("add black ip detected by waf to IPFS successfully");
	process.exit(1);
}

ipfsAddWafBlackIp();
