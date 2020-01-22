/**
 * Description: 
 *   Black ip data detected by Cloudbric WAF is collected every day.
 *   Amount of cumulated data is about 400,000 per day.
 *   The way Cloudbric share these valuable data to community is 
 *     1. Store original data to IPFS.
 *     2. Store cid of IPFS to Klaytn Smart Contract.
 *    This script is a script of Step 2.
 */
const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')
const caverConfig = require(path.join(APP_ROOT_DIR, 'config/caver'))
const contract = require(path.join(APP_ROOT_DIR, 'config/contract'))
const helper = require(path.join(APP_ROOT_DIR, 'helper/helper'))
// TODO: Error handle with pushq properly
const pushq = require(path.join(APP_ROOT_DIR, 'helper/pushq'))
const constant = require(path.join(APP_ROOT_DIR, 'config/constant'))
const dbPromiseInterface = require(path.join(APP_ROOT_DIR, 'db/db_promise'))
const eventWatcher = require(path.join(APP_ROOT_DIR, 'event/watcher'))

const vault = caverConfig.vault
const caver = caverConfig.caver
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage
const schemaLog = new dbPromiseInterface('log')

/**
 * Get brdailyIdx need to be inserted to smart contract.
 * @return {Object}
 */
async function _getBrdailyIdxInfoToBeAdded() {
    const query = 
        `SELECT brdaily_idx, from_address FROM brdaily_uploaded_log \
        WHERE storage_contract_address IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    let result = undefined
    let brdailyIdxInfo = {
        brdailyIdx: undefined,
        fromAddress: undefined
    }
    try {
        result = await schemaLog.query(query)
        brdailyIdxInfo.brdailyIdx =  result[0].brdaily_idx
        brdailyIdxInfo.fromAddress = result[0].from_address
    } catch (err) {
        console.log(err)
        exit(1)
    }

    if (result == undefined || brdailyIdxInfo.brdailyIdx == undefined) {
        console.log(`Select nothing, maybe there is logical error`)
        exit(1)
    }
    return brdailyIdxInfo
}

/**
 * Get a black ip detected by Cloudbric WAF.
 * @param {string | number} clbIndex index in Cloudbric DB
 * @return {Object}
 */
async function getWafBlackIpAtClbIndex(clbIndex) {
    if (typeof clbIndex === "number") {
        clbIndex = clbIndex.toString()
    }
    const wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtClbIndex(
        helper.stringToBytes32(clbIndex)
    ).call()
    return wafBlackIp
}

/**
 * Check whether black ip data already exists in smart contract "CloudbricWafBlackIpStorage".
 * @param {string | number} clbIndex same with brdailyIdx but generally it also called "clbIndex"
 * @return {boolean}
 */
async function _existsInSmartContract(clbIndex) {
    if (typeof clbIndex === "number") {
        clbIndex = clbIndex.toString()
    }
    const wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtClbIndex(
        helper.stringToBytes32(clbIndex)
    ).call()
    console.debug(`existsInSmartContract check whether ${clbIndex} already exists in Smart Contract or not`)
    console.debug(wafBlackIp)
    
    if (wafBlackIp.size == 0 || wafBlackIp == null) {
        console.debug(`${clbIndex} does not exists in Smart Contract`)
        return false
    }
    console.debug(`${clbIndex} exists in Smart Contract`)
    return true
}

/**
 * Check wether crash exists or not. If so restore crash.
 * @param {Object} brdailyIdxInfo which has two properties brdailyIdx and fromAddress
 */
async function _restoreCrash(brdailyIdxInfo) {
    try {
        const exists = await _existsInSmartContract(brdailyIdxInfo.brdailyIdx)
        if (exists) {
            console.debug(`${brdailyIdxInfo.brdailyIdx} is not a target because already exists in Smart Contract. So start restore crash...`)
            console.debug(`Get pastEvent using indexed parameter ${brdailyIdxInfo.fromAddress}`)
            const pastEvent = await eventWatcher.retrieveAddWafBlackIp(brdailyIdxInfo.fromAddress)
            let updateQuery = undefined
            if (pastEvent != undefined) { 
                console.debug(`found pastEvent which tell us "fromAddress added black ip data to Klaytn Contract"`)
                updateQuery = `UPDATE brdaily_uploaded_log \
                    SET storage_contract_address='${cloudbricWafBlackIpStorage._address}' \
                    SET storage_transaction_hash='${pastEvent.transactionHash}' \
                    WHERE brdaily_idx='${brdailyIdxInfo.brdailyIdx}'`

            // You might have question: "Why don't you update 'waf_black_ip_uploaded_date' field too?"
            // Here is answer: 
            //   1. If we have a transaction hash, we can get a block number.
            //   2. Now we can get a timestamp when the block was created using block number. 
            //   3. So we don't need uploaded date field actually.
            } else {
                console.debug(`Unexpected situation... LETS FIX IT NEAR IN THE FUTURE`)
                updateQuery = `UPDATE brdaily_uploaded_log \
                    SET storage_contract_address='${cloudbricWafBlackIpStorage._address}' \
                    WHERE brdaily_idx='${brdailyIdxInfo.brdailyIdx}'`
            }
            await schemaLog.query(updateQuery)
        } else {
            // data exists in Cloudbric database but not in Smart contract also, means OK
        }
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

/**
 * Get list of index to be added to blockchain.
 * @return {Array<number>}
 */
async function _getBrdailyIdxListToBeAdded() {
    const getBrdailyIdxList =
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_contract_address IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC LIMIT ${constant.WORKLOAD.WAF_BLACK_IP}`
    const rows = await schemaLog.query(getBrdailyIdxList)
    let brdailyIdxList = []
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx)
    })
    return brdailyIdxList
}


/**
 * Scan whole black ip data which is detected by Cloudbric WAF and print to console.
 */
async function scanWafBlackIpStorage() {
    const wafBlackIpListSize = await cloudbricWafBlackIpStorage.methods.wafBlackIpListSize().call()
    console.debug(`wafBlackIpListSize: ${wafBlackIpListSize}`)

    let wafBlackIp = undefined

    for (let i = 0; i < wafBlackIpListSize; i++) {
        wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtIndex(i).call()
        console.debug(wafBlackIp)
   }
}

/**
 * Get cid(contents identifier) info which is consists of below 3 fields.
 * 1. ipfs_cid: cid of IPFS contents which means black ip detected by Cloudbric WAF.
 * 2. from_address: who upload black ip to IPFS.
 * 3. from_private_key: private key of address.
 * @param {string | number} brdailyIdx 
 * @return {Object}
 */
async function _getIpfsCidInfo(brdailyIdx) {
    const selectCidQuery = `SELECT ipfs_cid, from_address, from_private_key \
        FROM brdaily_uploaded_log \
        WHERE brdaily_idx=${brdailyIdx}`
    const cidResult = await schemaLog.query(selectCidQuery)
    
    if (cidResult[0].ipfs_cid == null || cidResult[0].from_address == null || cidResult[0].from_private_key == null) {
        console.log(`No data at given brdaily_idx: ${brdailyIdx}`)
        process.exit(1)
    }
    return cidResult[0]
}

/**
 * Setup process before adding black ip detected by Cloudsbric WAF to Klaytn Smart Contract
 */
async function setupProcess() {
    let brdailyIdxInfo = await _getBrdailyIdxInfoToBeAdded()
    await _restoreCrash(brdailyIdxInfo)
}

/**
 * Add multiple black ip data which is detected by Cloudbric WAF sequnetially.
 */
async function addWafBlackIpBatch() {
    console.log('add batch start...')
    let feePayer = undefined
    try {
        feePayer = await caver.klay.accounts.wallet.add(
            vault.cypress.accounts.delegate.privateKey,
            vault.cypress.accounts.delegate.address
        )
    } catch (err) {
        console.log(err)
    }

    const brdailyIdxList = await _getBrdailyIdxListToBeAdded()
    let brdailyIdx = undefined

    for (let i = 0; i < brdailyIdxList.length; i++) {
        brdailyIdx = brdailyIdxList[i]
        console.log(brdailyIdx)
        const ipfsCidInfo = await _getIpfsCidInfo(brdailyIdx)
        const multihash = helper.ipfsHashToMultihash(ipfsCidInfo.ipfs_cid)

        const dataSet = {
            clbIndex: brdailyIdx,
            hash: multihash.hash,
            hashFunction: multihash.hashFunction,
            size: multihash.size
        }
        const encodedDataSet = helper.encodeDataSet(dataSet)
        const abiAddWafBlackIp = 
            cloudbricWafBlackIpStorage.methods.addWafBlackIp(
                encodedDataSet.encodedClbIndex, 
                encodedDataSet.encodedHash, 
                encodedDataSet.encodedHashFunction, 
                encodedDataSet.encodedSize
            ).encodeABI()

        let receipt = undefined
        try {
            receipt = await helper.feeDelegatedSmartContractExecute(
                ipfsCidInfo.from_address,
                ipfsCidInfo.from_private_key,
                cloudbricWafBlackIpStorage._address,
                feePayer,
                abiAddWafBlackIp
            )
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
        
        let uploaded_date = new Date().toISOString() // UTC format
        uploaded_date = uploaded_date.replace(/T/, ' ').replace(/\..+/, '')

        const updateQuery = `UPDATE brdaily_uploaded_log \
            SET storage_contract_address='${cloudbricWafBlackIpStorage._address}', \
            storage_transaction_hash='${receipt.transactionHash}', \
            waf_black_ip_uploaded_date='${uploaded_date}' \
            WHERE brdaily_idx='${brdailyIdx}'`

        // MySQL server close connection sometimes. Query statement printed is useful when things happen.
        console.log(updateQuery)
        try {
            await schemaLog.query(updateQuery)
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
    }
    console.log('Success to upload black ip data to Klaytn')
    process.exit(1)
}

(async function () {
    if (process.argv[2] == 'add') {
        await setupProcess()
        await addWafBlackIpBatch()
    } else if (process.argv[2] == 'scan') {
        await scanWafBlackIpStorage()
    } else if (process.argv[2] == 'restore') {
        await _restoreTransactionHashCrash()
    } else if (process.argv[2] == 'get') {
        const brdailyIdx = process.argv[3]
        const result = await getWafBlackIpAtClbIndex(brdailyIdx)
        console.debug(result)
    }
})()