const fs = require('fs');
const constant = require(`${__dirname}/../config/constant`);
const klaytnBridgePath = `${__dirname}/../klaytn_bridge`;
const ipfsBridgePath = `${__dirname}/../ipfs_bridge`;
const klaytnCommon = require(`${klaytnBridgePath}/common`);
const ipfsCommon = require(`${ipfsBridgePath}/common`);

/**
 * create a single work sheet of white list add transaction.
 * there is only one fee delegation account who actually send transaction to Klaytn.
 */
async function createSingleWhitListAddWorkSheet() {
    const file = `${klaytnBridgePath}/single_process/work_sheet/whitelist_worksheet.json`;
    if (fs.existsSync(file)) {
        // pas
    } else {
        console.log("work sheet is already exist. you don't finished your job yet.");
        process.exit(1);
    }
    let workSheet = {};
    const whiteListAddIndexList = await klaytnCommon.getWhiteListAddIndexList(); 
    const whiteListStartingIndex = whiteListAddIndexList[0];
    const whiteListDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1];
   
    console.log(`CREATE SINGLE WORK SHEET... FROM: ${whiteListStartingIndex}, to: ${whiteListDestinationIndex}`);

    workSheet.from = whiteListStartingIndex;
    workSheet.current = workSheet.from;
    workSheet.to = whiteListDestinationIndex;
    
    fs.writeFileSync(file, workSheet, 'utf-8', 'w');
    return true;
}

/**
 * distribute entire workload into argv[2]
 * create work_sheet to each worker
 */
async function splitWhiteListAddWorkload () {
    const directoryPath = `${klaytnBridgePath}/worker_process/work_sheet`;
    const fileList = fs.readdirSync(directoryPath);
    if (fileList != null) {
        console.log("work sheet is already exist. you don't finished your job yet.");
        process.exit(1);
    }

    const numOfWorkers = process.argv[2];
    const quota = constant.WORKLOAD / numOfWorkers;
    let workSheet = [];

    const whiteListAddIndexList = await klaytnCommon.getWhiteListAddIndexList(); 
    const whiteListStartingIndex = whiteListAddIndexList[0];
    const whiteListDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1];
    
    console.log(`CREATE ${numOfWorkers} WORK SHEET... FROM: ${whiteListStartingIndex}, to: ${whiteListDestinationIndex}`);
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {};
        workQuota.from = whiteListStartingIndex + (quota * (i - 1));
        workQuota.current = workQuota.from;

        let destinationIndex = whiteListStartingIndex + (quota * i) - 1;
        if (destinationIndex > whiteListDestinationIndex) {
            destinationIndex = whiteListDestinationIndex;
        }
        workQuota.to = destinationIndex;
        workQuota = JSON.stringify(workQuota);
        console.log(workQuota);
        workSheet.push(workQuota);
    }

    for (let i  = 0; i < workSheet.length; i++) {
        fs.writeFileSync(`${directoryPath}/white_list_worker_${i}.json`, workSheet[i] + '\n', 'utf-8', 'w');
    }
}

/**
 * create a single work sheet of waf black ip add transaction.
 * there is only one fee delegation account who actually send transaction to Klaytn.
 */
async function createSingleWafBlackIpAddWorkSheet() {
    const file = `${klaytnBridgePath}/single_process/work_sheet/waf_blackip_worksheet.json`;
    if (fs.existsSync(file)) {
        // pass
    } else {
        console.log("work sheet is already exist. you don't finished your job yet.");
        process.exit(1);
    }
    let workSheet = {};
    const wafBlackIpAddIndexList = await klaytnCommon.getWafBlackIpAddIndexList(); 
    const wafBlackIpStartingIndex = wafBlackIpAddIndexList[0];
    const wafBlackIpDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1];
   
    console.log(`CREATE SINGLE WORK SHEET... FROM: ${wafBlackIpStartingIndex}, to: ${wafBlackIpDestinationIndex}`);

    workSheet.from = wafBlackIpStartingIndex;
    workSheet.current = workSheet.from;
    workSheet.to = wafBlackIpDestinationIndex;
    
    fs.writeFileSync(file, workSheet, 'utf-8', 'w');
    return true;
}

/**
 * distribute entire workload into argv[2]
 * create work_sheet to each worker
 */
async function splitWafBlackIpAddWorkload () {
    const directoryPath = `${klaytnBridgePath}/worker_process/work_sheet`;
    const fileList = fs.readdirSync(directoryPath);
    if (fileList != null) {
        console.log("work sheet is already exist. you don't finished your job yet.");
        process.exit(1);
    }

    const numOfWorkers = process.argv[2];
    const quota = constant.WORKLOAD / numOfWorkers;
    let workSheet = [];

    const wafBlackIpAddIndexList = await klaytnCommon.getWafBlackIpAddIndexList(); 
    const wafBlackIpStartingIndex = wafBlackIpAddIndexList[0];
    const wafBlackIpDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1];
    
    console.log(`CREATE ${numOfWorkers} WORK SHEET... FROM: ${wafBlackIpStartingIndex}, to: ${wafBlackIpDestinationIndex}`);
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {};
        workQuota.from = whiteListStartingIndex + (quota * (i - 1));
        workQuota.current = workQuota.from;

        let destinationIndex = wafBlackIpStartingIndex + (quota * i) - 1;
        if (destinationIndex > wafBlackIpDestinationIndex) {
            destinationIndex = wafBlackIpDestinationIndex;
        }
        workQuota.to = destinationIndex;
        workQuota = JSON.stringify(workQuota);
        console.log(workQuota);
        workSheet.push(workQuota);
    }

    for (let i  = 0; i < workSheet.length; i++) {
        fs.writeFileSync(`${directoryPath}/white_list_worker_${i}.json`, workSheet[i] + '\n', 'utf-8', 'w');
    }
}

async function splitIpfsWafBlackIpAddWorkload () {
    const directoryPath = `${ipfsBridgePath}/worker_process/`;
    const isWorkSheetExist = fs.readdirSync(directoryPath);
    if (isWorkSheetExist) {
        console.log("work sheet is already exist. you don't finished your job yet.");
        process.exit(1);
    }

    const numOfWorkers = process.argv[2];
    const quota = constant.WORKLOAD / numOfWorkers;
    let workSheet = [];

    const ipfsAddIndexList = fs.readdirSync(`${__dirname}/../data/waf_black_ip/`)
    const ipfsStartingIndex = wafBlackIpAddIndexList[0];
    const ipfsDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1];
    
    console.log(`CREATE ${numOfWorkers} WORK SHEET... FROM: ${ipfsStartingIndex}, to: ${ipfsDestinationIndex}`);
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {};
        workQuota.from = ipfsStartingIndex + (quota * (i - 1));
        workQuota.current = workQuota.from;

        let destinationIndex = ipfsStartingIndex + (quota * i) - 1;
        if (destinationIndex > ipfsDestinationIndex) {
            destinationIndex = ipfsDestinationIndex;
        }
        workQuota.to = destinationIndex;
        workQuota = JSON.stringify(workQuota);
        console.log(workQuota);
        workSheet.push(workQuota);
    }

    for (let i  = 0; i < workSheet.length; i++) {
        fs.writeFileSync(`${directoryPath}/ipfs_worker_${i}.json`, workSheet[i], 'utf-8', 'w');
    }
}