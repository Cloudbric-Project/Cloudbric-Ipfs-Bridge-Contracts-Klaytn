const fs = require('fs')
const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')

let private = fs.readFileSync(path.join(APP_ROOT_DIR, 'private/.ipfs.json')).toString()
private = JSON.parse(private) 

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient(private.ipfsNode.host)
const helper = require(path.join(APP_ROOT_DIR, 'helper/helper'))
const pushq = require(path.join(APP_ROOT_DIR, 'helper/pushq'))
const dbPromiseInterface = require(path.join(APP_ROOT_DIR, 'db/db_promise'))

const schemaLog = new dbPromiseInterface('log');
const dataStorage = path.join(APP_ROOT_DIR, 'data/waf_black_ip')

 /**
 * write waf_black_ip data in /data/waf_black_ip/<brdaily_idx>.json format to IPFS.
 * also write log in the database table.
 */
async function addWafBlackIpToIpfs() {
    const failedList = fs.readdirSync(dataStorage);
    for (let i = 0; i < failedList.length; i++) {
        const fileName = `${dataStorage}/${failedList[i]}`
        const idx = failedList[i].slice(0, failedList[i].length - 5);

        const wafBlackIpJson = fs.readFileSync(fileName).toString();
        const bufferedWafBlackIp = Buffer.from(wafBlackIpJson);

        let result = undefined;
        let addedWafBlackIp = undefined;
        try {
            result = await ipfs.add(bufferedWafBlackIp, {pin: true});
            addedWafBlackIp = result[0];
        } catch (error) {
            const message = helper.createErrorMessage('add waf black ip data to IPFS', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
        console.log(`${idx} IS UPLOADED TO IPFS`);
        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        let stmt = `INSERT INTO brdaily_uploaded_log (brdaily_idx, ipfs_cid, ipfs_uploaded_date) VALUES(?,?,?)`;
        let values = [idx, addedWafBlackIp.hash, uploaded_date];
        try {
            await schemaLog.query(stmt, values);
            console.log("INSERT DB SUCCESS");
            const multihash = helper.ipfsHashToMultihash(addedWafBlackIp.hash);
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

(async function() {
    if (process.argv[2] == 'add') {
        console.log(`add batch start...`)
        await addWafBlackIpToIpfs()
    }
})()