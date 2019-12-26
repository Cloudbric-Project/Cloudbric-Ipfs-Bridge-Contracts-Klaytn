const fs = require('fs')
const path = require('path')

const APP_ROOT_DIR = path.join(__dirname, '..')

const constant = require(path.join(APP_ROOT_DIR, 'config/constant'))
const klaytnBridgePath = `${__dirname}/../klaytn_bridge`
const ipfsBridgePath = `${__dirname}/../ipfs_bridge`
const klaytnCommon = require(`${klaytnBridgePath}/common`)
const ipfsCommon = require(`${ipfsBridgePath}/common`)

// TODO:
// Cloudbric do not use multi worker process right now.
// When we need to process workload more fast, then we would use this process.

/**
 * create a single work sheet of white list add transaction.
 * there is only one fee delegation account who actually send transaction to Klaytn.
 */
async function createSingleWhitListAddWorkSheet() {
    const file = `${klaytnBridgePath}/single_process/work_sheet/whitelist_worksheet.json`
    if (fs.existsSync(file)) {
        console.log("work sheet is already exist. you don't finished your job yet.")
        process.exit(1)
    } else {
        // pass
    }

    let workQuota = {}
    const whiteListAddIndexList = await klaytnCommon.getWhiteListAddIndexList() 
    const whiteListStartingIndex = whiteListAddIndexList[0]
    const whiteListDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1]
   
    console.log(`CREATE SINGLE WORK SHEET... FROM: ${whiteListStartingIndex}, to: ${whiteListDestinationIndex}`)

    workQuota.from = whiteListStartingIndex
    workQuota.current = workQuota.from
    workQuota.to = whiteListDestinationIndex
    workQuota = JSON.stringify(workQuota)
    console.log(workQuota)

    try {
        fs.writeFileSync(file, workQuota, 'utf-8', 'w')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
    return true
}

/**
 * distribute entire workload into argv[2]
 * create work_sheet to each worker
 */
async function splitWhiteListAddWorkload () {
    const directoryPath = `${klaytnBridgePath}/worker_process/work_sheet`
    const workSheetList = fs.readdirSync(directoryPath)
    if(workSheetList === undefined || workSheetList.length == 0) {
        // pass
    } else {
        console.log("work sheet is already exist. you don't finished your job yet.")
        process.exit(1)
    }

    const numOfWorkers = process.argv[2]
    if (numOfWorkers == null) {
        console.log(`Please input parameter(numOfWorker)`)
        process.exit(1)
    }
    const quota = constant.WORKLOAD / numOfWorkers
    let workSheet = []

    const whiteListAddIndexList = await klaytnCommon.getWhiteListAddIndexList() 
    const whiteListStartingIndex = whiteListAddIndexList[0]
    const whiteListDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1]
    
    console.log(`CREATE ${numOfWorkers} WORK SHEET... FROM: ${whiteListStartingIndex}, to: ${whiteListDestinationIndex}`)
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {}
        workQuota.from = whiteListStartingIndex + (quota * (i - 1))
        workQuota.current = workQuota.from

        let destinationIndex = whiteListStartingIndex + (quota * i) - 1
        if (destinationIndex > whiteListDestinationIndex) {
            destinationIndex = whiteListDestinationIndex
        }
        workQuota.to = destinationIndex
        workQuota = JSON.stringify(workQuota)
        console.log(workQuota)
        workSheet.push(workQuota)
    }

    for (let i  = 0; i < workSheet.length; i++) {
        fs.writeFileSync(`${directoryPath}/white_list_worker_${i}.json`, workSheet[i] + '\n', 'utf-8', 'w')
    }
}

/**
 * create a single work sheet of waf black ip add transaction.
 * there is only one fee delegation account who actually send transaction to Klaytn.
 */
async function createSingleWafBlackIpAddWorkSheet() {
    const file = `${klaytnBridgePath}/single_process/work_sheet/waf_black_ip_worksheet.json`
    if (fs.existsSync(file)) {
        console.log("work sheet is already exist. you don't finished your job yet.")
        process.exit(1)
    } else {
        // pass
    }
    let workQuota = {}
    const wafBlackIpAddIndexList = await klaytnCommon.getWafBlackIpAddIndexList() 
    const length = wafBlackIpAddIndexList.length
    const wafBlackIpStartingIndex = wafBlackIpAddIndexList[0]
    const wafBlackIpDestinationIndex = wafBlackIpAddIndexList[length - 1]
   
    console.log(`CREATE SINGLE WORK SHEET... FROM: ${wafBlackIpStartingIndex}, to: ${wafBlackIpDestinationIndex}`)

    workQuota.from = wafBlackIpStartingIndex
    workQuota.current = workQuota.from
    workQuota.to = wafBlackIpDestinationIndex
    workQuota = JSON.stringify(workQuota)
    console.log(workQuota)
   
    try {
        fs.writeFileSync(file, workQuota, 'utf-8', 'w')
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
    return true
}

/**
 * distribute entire workload into argv[2]
 * create work_sheet to each worker
 */
async function splitWafBlackIpAddWorkload () {
    const directoryPath = `${klaytnBridgePath}/worker_process/work_sheet`
    const workSheetList = fs.readdirSync(directoryPath)
    if(workSheetList === undefined || workSheetList.length == 0) {
        // pass
    } else {
        console.log("work sheet is already exist. you don't finished your job yet.")
        process.exit(1)
    }

    const numOfWorkers = process.argv[2]
    if (numOfWorkers == null) {
        console.log(`Please input parameter(numOfWorker)`)
        process.exit(1)
    }
    const quota = constant.WORKLOAD / numOfWorkers
    let workSheet = []

    const wafBlackIpAddIndexList = await klaytnCommon.getWafBlackIpAddIndexList() 
    const wafBlackIpStartingIndex = wafBlackIpAddIndexList[0]
    const wafBlackIpDestinationIndex = whiteListAddIndexList[whiteListAddIndexList.length - 1]
    
    console.log(`CREATE ${numOfWorkers} WORK SHEET... FROM: ${wafBlackIpStartingIndex}, to: ${wafBlackIpDestinationIndex}`)
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {}
        workQuota.from = whiteListStartingIndex + (quota * (i - 1))
        workQuota.current = workQuota.from

        let destinationIndex = wafBlackIpStartingIndex + (quota * i) - 1
        if (destinationIndex > wafBlackIpDestinationIndex) {
            destinationIndex = wafBlackIpDestinationIndex
        }
        workQuota.to = destinationIndex
        workQuota = JSON.stringify(workQuota)
        console.log(workQuota)
        workSheet.push(workQuota)
    }

    for (let i  = 0; i < workSheet.length; i++) {
        fs.writeFileSync(`${directoryPath}/white_list_worker_${i}.json`, workSheet[i] + '\n', 'utf-8', 'w')
    }
}

async function splitIpfsWafBlackIpAddWorkload () {
    const directoryPath = `${ipfsBridgePath}/worker_process/work_sheet/waf_black_ip`
    const workSheetList = fs.readdirSync(directoryPath)
    if(workSheetList === undefined || workSheetList.length == 0) {
        // pass
    } else {
        console.log("work sheet is already exist. you don't finished your job yet.")
        process.exit(1)
    }

    const numOfWorkers = process.argv[2]
    if (numOfWorkers == null) {
        console.log(`Please input parameter(numOfWorker)`)
        process.exit(1)
    }
    const dataStorage = `${__dirname}/../data/waf_black_ip`
    const dataList = fs.readdirSync(dataStorage)
    const quota = dataList.length / numOfWorkers
    let workSheet = []

    const ipfsAddIndexList = fs.readdirSync(`${__dirname}/../data/waf_black_ip/`)
    if (ipfsAddIndexList === undefined || ipfsAddIndexList.length == 0) {
        console.log("You must execute preprocess waf black ip script.")
        process.exit(1)
    }

    let ipfsStartingIndex = ipfsAddIndexList[0]
    let ipfsDestinationIndex = ipfsAddIndexList[ipfsAddIndexList.length - 1]

    // remove file extension .json and convert to Number 
    ipfsStartingIndex = parseInt(ipfsStartingIndex.slice(0, ipfsStartingIndex.length - 5))
    ipfsDestinationIndex = parseInt(ipfsDestinationIndex.slice(0, ipfsDestinationIndex.length - 5))
    
    console.log(`CREATE ${numOfWorkers} WORK SHEET... FROM: ${ipfsStartingIndex}, to: ${ipfsDestinationIndex}`)
    
    for (let i = 1; i <= numOfWorkers; i++) {
        let workQuota = {}
        workQuota.from = ipfsStartingIndex + (quota * (i - 1))
        workQuota.current = workQuota.from

        let destinationIndex = ipfsStartingIndex + (quota * i) - 1
        if (destinationIndex > ipfsDestinationIndex) {
            destinationIndex = ipfsDestinationIndex
        }
        workQuota.to = destinationIndex
        workQuota = JSON.stringify(workQuota)
        console.log(workQuota)
        workSheet.push(workQuota)
    }

    for (let i  = 0; i < workSheet.length; i++) {
        fs.writeFileSync(`${directoryPath}/ipfs_worker_${i}.json`, workSheet[i], 'utf-8', 'w')
    }
}

module.exports = {
    createSingleWhitListAddWorkSheet: createSingleWhitListAddWorkSheet,
    createSingleWafBlackIpAddWorkSheet: createSingleWafBlackIpAddWorkSheet,
    splitWhiteListAddWorkload: splitWhiteListAddWorkload,
    splitWafBlackIpAddWorkload: splitWafBlackIpAddWorkload,
    splitIpfsWafBlackIpAddWorkload: splitIpfsWafBlackIpAddWorkload
}