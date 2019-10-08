const fs = require('fs');
const path = require('path');

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient('/ip4/172.105.229.53/tcp/5001/'); 

// direcotry path setup
const appDir = path.dirname('index.js');
const helper = require(`${appDir}/helper/helper`);
const preprocess = require(`${appDir}/helper/preprocess`);

const dbPromiseInterface = require(`${appDir}/db/db_promise`);
const schemaLog = new dbPromiseInterface('log');

const logger = require(`${appDir}/helper/logger`);
const wafBlackIpLogger = logger.getLogger("wafBlackIp");

const pushq = require(`${appDir}/helper/pushq`);

// logging process setup
const INITIAL_TO_BE_INSERTED_IDX = 210511986;

async function wafBlackIpInsert(startIdx, limit) {
    for (let i = 0; i < limit; i++) {
        let idx = startIdx + i;
        console.log(idx);
        let fileName = `./data/waf_black_ip/${idx}.json`;

        const wafBlackIpJson = fs.readFileSync(fileName).toString();
        const bufferedWafBlackIp = Buffer.from(wafBlackIpJson);
        // encrypt message with some key
        
    
        try {
            const result = await ipfs.add(bufferedWafBlackIp, {pin: true});
            const wafBlackIpAdded = result[0];
            let uploaded_date = new Date().toISOString(); // UTC format
            uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '');

            let stmt = `INSERT INTO brdaily_uploaded_log (brdaily_idx, ipfs_cid, ipfs_uploaded_date) VALUES(?,?,?)`;
            let values = [idx, wafBlackIpAdded.hash, uploaded_date];
            await schemaLog.query(stmt, values);

            const multihash = helper.ipfsHashToMultihash(wafBlackIpAdded.hash);
            const message = logger.getLoggerFormat(
                "SUCCESS",
                {
                    "IDX": idx,
                    "PATH": wafBlackIpAdded.path,
                    "CID": wafBlackIpAdded.hash,
                    "HASH_FUNCTION": multihash.hashFunction,
                    "HASH": multihash.hash,
                    "SIZE": multihash.size
                },
                `INSERT ${idx}'s row FROM brdaily to IPFS`
            );
            wafBlackIpLogger.ipfs.debug(message);
            // delete uploaded file
            fs.unlinkSync(fileName);
        } catch (error) { 
            console.log(error);
        }
    }
    logger.shutdown();
}

async function checkWafBlackIp(hash) {
    const file = await ipfs.cat(hash);
    const jsonFile = JSON.parse(file.toString('utf-8'));
    console.log(jsonFile);
}

//checkWafBlackIp('QmRKThUKt3yrcBMDvsJN7MR42u7y6dwmanHshe9nSEkz57');

// you must check length before start process
async function routine() {
    let lastInsertedIndex = await preprocess.getLastInsertedIdx();
    // 라인 못 읽어와도 예외처리 + 프로세스 종료
    let startIndex = lastInsertedIndex + 1;
    console.log(startIndex);
    await wafBlackIpInsert(startIndex, 1000);
    process.exit(1);
}
routine();