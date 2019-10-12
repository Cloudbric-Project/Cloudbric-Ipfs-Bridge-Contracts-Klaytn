const fs = require('fs');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/172.105.229.53/tcp/5001/'); 

// direcotry path setup
const helper = require(`./helper/helper`);
const dbPromiseInterface = require(`./db/db_promise`);
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `./data/waf_black_ip`;
const pushq = require(`./helper/pushq`);

/**
 * 
 * @param {Integer} startIdx 
 * @param {Integer} limit 
 */
async function wafBlackIpInsert(startIdx, limit) {
    for (let i = 0; i < limit; i++) {
        let idx = startIdx + i;
        let fileName = `./data/waf_black_ip/${idx}.json`;
        console.log(`READ ${fileName}`);

        const wafBlackIpJson = fs.readFileSync(fileName).toString();
        const bufferedWafBlackIp = Buffer.from(wafBlackIpJson);
        
        // encrypt message with some key
       
        let result = null;
        let wafBlackIpAdded = null;
        try {
            result = await ipfs.add(bufferedWafBlackIp, {pin: true});
            wafBlackIpAdded = result[0];

        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(`${idx} IS UPLOADED TO IPFS`);

        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        const stmt = `INSERT INTO brdaily_uploaded_log (brdaily_idx, ipfs_cid, ipfs_uploaded_date) VALUES(?,?,?)`;
        const values = [idx, wafBlackIpAdded.hash, uploaded_date];
        try {
            await schemaLog.query(stmt, values);
            // delete uploaded file for storage issue.
            fs.unlinkSync(fileName);
        } catch (error) { 
            console.log(error);
            process.exit(1);
        }
    }
}

async function checkWafBlackIp(hash) {
    const file = await ipfs.cat(hash);
    const jsonFile = JSON.parse(file.toString('utf-8'));
    console.log(jsonFile);
}

//checkWafBlackIp('QmRKThUKt3yrcBMDvsJN7MR42u7y6dwmanHshe9nSEkz57');
async function routine() {
    const getLastInsertedIdxQuery = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        ORDER BY brdaily_idx DESC LIMIT 1`;

    const result = await schemaLog.query(getLastInsertedIdxQuery);
    const lastInsertedIdx = result[0].brdaily_idx;
    const startIndex = lastInsertedIdx + 1;
    console.log(`FROM brdaily_idx ${startIndex} START INSERT IPFS DATA AND UPDATE DB`);
    await wafBlackIpInsert(startIndex, process.argv[2]);
    console.log("END UPLOAD IPFS DATA AND INSERT DB");
    process.exit(1);
}

async function failover() {
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
            console.log(error);
            process.exit(1);
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
            console.log(error);
            process.exit(1);
        }
    }
    console.log("failover ended");
}
//routine();
failover();
