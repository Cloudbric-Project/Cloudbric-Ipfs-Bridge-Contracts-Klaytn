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

const vault = caverConfig.vault
const caver = caverConfig.caver
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage
const schemaLog = new dbPromiseInterface('log')

/**
 * Get brdailyIdx need to be inserted to smart contract.
 * @return {String}
 */
async function _getBrdailyIdxToBeAdded() {
    const query = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_contract_address IS NULL \
        AND whitelist_transaction_hash IS NOT NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    let result = undefined 
    let brdailyIdx = undefined
    try {
        result = await schemaLog.query(query)
        brdailyIdx =  result[0].brdaily_idx
    } catch (err) {
        console.log(err)
        exit(1)
    }

    if (result == undefined || brdailyIdx == undefined) {
        console.log(`Select nothing, maybe there is logical error`)
        exit(1)
    }
    return brdailyIdx
}

/**
 * Get a black ip detected by Cloudbric WAF.
 * @param {String | Number} clbIndex index in Cloudbric DB
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
 * Check whether black ip data already exsits in smart contract "CloudbricWafBlackIpStorage".
 * @param {String | Number} clbIndex same with brdailyIdx but generally it also called "clbIndex"
 * @return {Boolean}
 */
async function _exsitsInSmartContract(clbIndex) {
    if (typeof clbIndex === "number") {
        clbIndex = clbIndex.toString()
    }
    const wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtClbIndex(
        helper.stringToBytes32(clbIndex)
    ).call()
    console.debug(`exsitsInSmartContract check whether ${clbIndex} already exists in Smart Contract or not`)
    console.debug(wafBlackIp)
    
    if (wafBlackIp == undefined || wafBlackIp == null) {
        return false
    }
    return true
}

/**
 * Check wether crash exsits or not. If so restore crash.
 * @param {String} brdailyIdx 
 */
async function _restoreCrash(brdailyIdx) {
    try {
        const exists = _exsitsInSmartContract(brdailyIdx)
        if (exists) {
            // FIX ME: restoring crash must include below steps.
            // 1. Search block related with lastInsertedBrdailyIdx.
            // 2. Update uploaded date with date when block created.
            // 3. To do, we should write some code to track events.
            // 4. And Update uploaded_date too.
            console.debug('Data exsits in Cloudbric and Smart contract also')
            console.debug(`So ${brdailyIdx} is not a target, now start restore crash...`)
            const updateQuery = `UPDATE brdaily_uploaded_log \
                SET storage_contract_address='${cloudbricWafBlackIpStorage._address}' \
                WHERE brdaily_idx='${brdailyIdx}'`
            await schemaLog.query(updateQuery)
        } else {
            // data exsits in Cloudbric database but not in Smart contract also, means OK
        }
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

/**
 * Get list of index to be added to blockchain.
 * @return {Array<Number>}
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
    console.log(wafBlackIpListSize)

    let wafBlackIp = undefined
    for (let i = 0; i < wafBlackIpListSize; i++) {
        wafBlackIp = await cloudbricWafBlackIpStorage.methods.getWafBlackIpAtIndex(i).call()
   }
}

/**
 * Get cid(contents identifier) info which is consists of below 3 fields.
 * 1. ipfs_cid: cid of IPFS contents which means black ip detected by Cloudbric WAF.
 * 2. from_address: who upload black ip to IPFS.
 * 3. from_private_key: private key of address.
 * @param {String | Number} brdailyIdx 
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
 * Check wether crash exsits or not and take action properly.
 * @return {String} brdailyIndex need to be inserted into smart contract.
 */
async function setupProcess() {
    let brdailyIdx = await _getBrdailyIdxToBeAdded()
    await _restoreCrash(brdailyIdx)
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
    }
})()