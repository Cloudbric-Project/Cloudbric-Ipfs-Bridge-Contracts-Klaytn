const fs = require('fs');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/172.105.229.53/tcp/5001/'); 

// direcotry path setup
const dbPromiseInterface = require(`${__dirname}/../../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `${__dirname}/../../data/threatdb/hacker_wallet`;
const helper = require(`${__dirname}/../../helper/helper`);
const pushq = require(`${__dirname}/../../helper/pushq`);

/**
 * write waf_black_ip data in /data/waf_black_ip/<brdaily_idx>.json format to IPFS.
 * also write log in the database table.
 */
async function ipfsAddHackerWallet() {
    const failedList = fs.readdirSync(dataStorage);
    for (let i = 0; i < failedList.length; i++) {
        const fileName = `${dataStorage}/${failedList[i]}`
        const idx = failedList[i].slice(0, failedList[i].length - 5);

        const hackerWalletJson = fs.readFileSync(fileName).toString();
        const bufferedHackerWallet = Buffer.from(hackerWalletJson);
        let result = null;
        let hackerWalletAdded = null;

        try {
            result = await ipfs.add(bufferedHackerWallet, {pin: true});
            hackerWalletAdded = result[0];
        } catch (error) {
            const message = helper.createErrorMessage('add hacker wallet data to IPFS', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
        console.log(`${idx} IS UPLOADED TO IPFS`);
        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        let stmt = `INSERT INTO brdaily_uploaded_log (hacker_wallet_detail_idx, ipfs_cid, ipfs_uploaded_date) VALUES(?,?,?)`;
        let values = [idx, hackerWalletAdded.hash, uploaded_date];
        try {
            await schemaLog.query(stmt, values);
            console.log("INSERT DB SUCCESS");
            const multihash = helper.ipfsHashToMultihash(hackerWalletAdded.hash);
            // delete uploaded file for storage issue.
            fs.unlinkSync(fileName);
        } catch (error) {
            const message = helper.createErrorMessage('inser into hacker_wallet_uploaded_table', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
    }
    console.log("hacker wallet is uploaded to IPFS successfully");
	process.exit(1);
}

ipfsAddHackerWallet();
