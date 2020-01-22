/**
 * Description:
 *   Event Watcher is a utility script which can retrieve Klaytn event of Cloudbric's Contract.
 *   Each function has a naming convention
 *     * function retrieve|<name of function>(<indexed param>)
 */
const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')
const contract = require(path.join(APP_ROOT_DIR, 'config/contract'))
const cloudbricWafBlackIpStorage = contract.cloudbricWafBlackIpStorage
const DEPLOYED_BLOCK_NUMBER = 9178269

/**
 * Retrieve AddWafBlackIp event.
 * @param {string} from address who send transaction with addWafBlackIp
 */
async function retrieveAddWafBlackIp(from) {
    const pastEvents = await cloudbricWafBlackIpStorage.getPastEvents('AddWafBlackIp', {
        filter: {
            from: from
        },
        fromBlock: DEPLOYED_BLOCK_NUMBER,
        toBlock: 'latest'
    })
    return pastEvents[0]
}

module.exports = {
    retrieveAddWafBlackIp: retrieveAddWafBlackIp
}