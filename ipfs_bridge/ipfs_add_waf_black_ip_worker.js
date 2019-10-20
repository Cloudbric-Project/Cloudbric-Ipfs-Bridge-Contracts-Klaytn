const fs = require('fs');
const readLastLines = require('read-last-lines');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/172.105.229.53/tcp/5001/'); 

const helper = require(`${__dirname}/../helper/helper`);
const dbPromiseInterface = require(`${__dirname}/../db/db_promise`);
const schemaLog = new dbPromiseInterface('log');
const dataStorage = `${__dirname}/../data/waf_black_ip`;
const pushq = require(`${__dirname}/../helper/pushq`);

async function addWafBlackIpWorker() {
    const worker = process.argv[2];
    const workSheet = `${__dirname}/worker_process/work_sheet/waf_black_ip/ipfs_worker_${worker}.json`;

    console.log(workSheet);
    if (fs.existsSync(workSheet)) {
        // pass
    } else {
        console.log(`workSheet isn't exist. prcoess seems to be over.`);
        process.exit(1);
    }
 
    const rawdata = await readLastLines.read(workSheet, 1);
    const workQuota = JSON.parse(rawdata);

    // create workStatus for managing status.
    let workStatus = {};
    workStatus.from = parseInt(workQuota.from);
    workStatus.to = parseInt(workQuota.to);
    workStatus.current = parseInt(workQuota.current);

    const start_time = new Date();
    while (true) {
        let file = `${dataStorage}/${workStatus.current}.json`;
        // check while file is exist.
        while (true) {
            if (fs.existsSync(file)) {
                break;
            } {
                console.log(`${workStatus.current}.json dosen't exist. find another file...`);
                workStatus.current++;
                if (workStatus.current >= workStatus.to) {
                    console.log(`there is no matching json files... maybe all idx in brdaily table dosen't exist in db...`);
                    process.exit(1);
                }
                file = `${dataStorage}/${workStatus.current}.json`;
            }
        }

        const wafBlackIpJson = fs.readFileSync(file).toString();
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
        console.log(`${workStatus.current} is uploaded to IPFS`);
        
        let uploaded_date = new Date().toISOString(); // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

        let stmt = `INSERT INTO brdaily_uploaded_log (brdaily_idx, ipfs_cid, ipfs_uploaded_date) VALUES(?,?,?)`;
        let values = [workStatus.current, wafBlackIpAdded.hash, uploaded_date];

        try {
            await schemaLog.query(stmt, values);
            console.log(`inserted to database.`);
            const multihash = helper.ipfsHashToMultihash(wafBlackIpAdded.hash);
            // delete uploaded file for storage issue.
            fs.unlinkSync(file);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
        console.log(`${workStatus.current}.json is uploaded to DB and deleted.`);

        // write to workSheet
        workStatus.uploaded_date = uploaded_date;

        try {
            fs.appendFileSync(workSheet, JSON.stringify(workStatus) + '\n');
        } catch (error) {
            console.log(error);
            process.exit(1);
        }

        workStatus.current++;
        if (workStatus.current > workStatus.to) {
            console.log(`Work is done. delete work sheet...`);
            //fs.unlinkSync(workSheet);
            break;
        }
    }
    const end_time = new Date();
    const elapsed= end_time.getTime() - start_time.getTime();
    const seconds = Math.floor(elapsed / 1000);
    console.log(`elapsed: ${seconds}`);

    process.exit(1); 
}

addWafBlackIpWorker();