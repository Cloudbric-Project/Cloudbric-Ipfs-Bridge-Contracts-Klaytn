const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')
const caverConfig = require(path.join(APP_ROOT_DIR, 'config/caver'))
const contract = require(path.join(APP_ROOT_DIR, 'config/contract'))
const helper = require(path.join(APP_ROOT_DIR, 'helper/helper'))
const pushq = require(path.join(APP_ROOT_DIR, 'helper/pushq'))
const constant = require(path.join(APP_ROOT_DIR, 'config/constant'))
const dbPromiseInterface = require(path.join(APP_ROOT_DIR, 'db/db_promise'))

const caver = caverConfig.caver
const vault = caverConfig.vault
const whiteList = contract.whiteList 
const schemaLog = new dbPromiseInterface('log')

/**
 * Add single address to Cloudbric's WhiteList smart contract.
 * @param {String} address 
 * @param {Object} feePayer 
 */
async function addWhiteList(address, feePayer) { 
    let abiAddWhiteList = 
        whiteList.methods.addWhiteList(
            address
        ).encodeABI()

    // only deployer can add user to whitelist
    try {
        const receipt = await helper.feeDelegatedSmartContractExecute(
            vault.cypress.accounts.deployer.address,
            vault.cypress.accounts.deployer.privateKey,
            whiteList._address,
            feePayer,
            abiAddWhiteList
        )
        return receipt
    } catch (error) {
        const message = helper.createErrorMessage('', __filename)
        pushq.sendMessage(message)
        throw new Error(error)
    }
}


/**
 * Get index to be added to blockchain.
 * @return {Number}
 */
async function _getWhiteListIndexToBeAdded() {
    const query = 
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NULL \
        ORDER BY brdaily_idx ASC LIMIT 1`
    const result = await schemaLog.query(query)
    const brdailyIdx = result[0].brdaily_idx

    return brdailyIdx
}

/**
 * Get list of index to be added to blockchain.
 * @return {Array<Number>}
 */
async function _getWhiteListIndexListToBeAdded() {
    const getBrdailyIdxList =
        `SELECT brdaily_idx FROM brdaily_uploaded_log \
        WHERE storage_transaction_hash IS NULL \
        AND whitelist_transaction_hash IS NULL \
        ORDER BY brdaily_idx ASC LIMIT ${constant.WORKLOAD.WAF_BLACK_IP}`
    const rows = await schemaLog.query(getBrdailyIdxList)
    let brdailyIdxList = []
    rows.forEach(row => {
        brdailyIdxList.push(row.brdaily_idx)
    })
    return brdailyIdxList
}

/**
 * Add user who uploaded black ip data to IPFS to WhiteList
 */
async function addWhiteListUsingList() {
    const feePayer = await caver.klay.accounts.wallet.add(
        vault.cypress.accounts.delegate.privateKey,
        vault.cypress.accounts.delegate.address
    )
    const brdailyIdxList = await _getWhiteListIndexListToBeAdded()

    console.log("CREATE ACCOUNT...")
    await caver.klay.accounts.wallet.create(brdailyIdxList.length)
    
    let brdailyIdx = undefined
    let lastBrdailyIdx = brdailyIdxList[brdailyIdxList.length - 1]

    for (let i = 0; i < brdailyIdxList.length; i++) {
        brdailyIdx = brdailyIdxList[i] 
        console.log(`++++++++++++++++++++++++++++++++++++++${i}'th Iteration ${brdailyIdx} / ${lastBrdailyIdx}++++++++++++++++++++++++++++++++++++++`)
        const key = caver.klay.accounts.wallet.getKlaytnWalletKey(i + 1)
        const account = {
            "address": key.slice(70,140),
            "privateKey": key.slice(0,66)
        }
        console.log(`address: ${account.address}`)
        console.log(`privateKey: ${account.privateKey}`)
        let receipt = undefined
        try {
            receipt = await addWhiteList(account.address, feePayer)
        } catch (error) {
            const message = helper.createErrorMessage('add white list', __filename)
            pushq.sendMessage(message)
            throw new Error(error)
        }

        console.log(`whiteListTxHash: ${receipt.transactionHash}`)

        let uploadedDate = new Date().toISOString() // UTC format
        uploadedDate = uploadedDate.replace(/T/, ' ').replace(/\..+/, '')

        const updateQuery = 
            `UPDATE brdaily_uploaded_log \
            SET whitelist_contract_address='${whiteList._address}', \
            whitelist_transaction_hash='${receipt.transactionHash}', \
            whitelist_uploaded_date='${uploadedDate}', \
            from_address='${account.address}', \
            from_private_key='${account.privateKey}' \
            WHERE brdaily_idx='${brdailyIdx}'`

        try {
            await schemaLog.query(updateQuery)
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
        console.log(`--------------------------------------${i}'th Iteration--------------------------------------`) 
    }
    process.exit(1)
}

(async function () {
    if (process.argv[2] == 'add') {
        console.log('add batch start...')
        await addWhiteListUsingList()
    }
})()