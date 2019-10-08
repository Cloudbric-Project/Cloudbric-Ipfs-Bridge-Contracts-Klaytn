const dateTime = require('node-datetime');
const path = require('path');
let log4js = require('log4js');
const appDir = path.dirname('index.js');
const logStorage = `${appDir}/log`;

// log file name format
const dt = dateTime.create();
const todayYmd = dt.format('Y_m_d');

log4js.addLayout('json', function(config) {
    return function(logEvent) { return JSON.stringify(logEvent) + config.separator; }
});

/**
 * configure log4js
 * each appneder has 4 type of logger: fetch, convert, ipfs, klaytn
 */
log4js.configure({
    appenders: {
        system: { 
            type: 'file',
            filename: `${logStorage}/system/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        fetchWafBlackIp: { 
            type: 'file',
            filename: `${logStorage}/waf_black_ip/fetch_rows/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        convertWafBlackIp: { 
            type: 'file',
            filename: `${logStorage}/waf_black_ip/convert_row_to_json/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        ipfsWafBlackIp: { 
            type: 'file',
            filename: `${logStorage}/waf_black_ip/ipfs_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        klaytnWafBlackIp: { 
            type: 'file',
            filename: `${logStorage}/waf_black_ip/klaytn_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        fetchBlackIp: { 
            type: 'file',
            filename: `${logStorage}/threatdb/black_ip/fetch_rows/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        convertBlackIp: { 
            type: 'file',
            filename: `${logStorage}/threatdb/black_ip/convert_row_to_json/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        ipfsBlackIp: { 
            type: 'file',
            filename: `${logStorage}/threatdb/black_ip/ipfs_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        klaytnBlackIp: { 
            type: 'file',
            filename: `${logStorage}/threatdb/black_ip/klaytn_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        fetchHackerWallet: { 
            type: 'file',
            filename: `${logStorage}/threatdb/hacker_wallet/fetch_rows/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        convertHackerWallet: { 
            type: 'file',
            filename: `${logStorage}/threatdb/hacker_wallet/convert_row_to_json/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        ipfsHackerWallet: { 
            type: 'file',
            filename: `${logStorage}/threatdb/hacker_wallet/ipfs_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        klaytnHackerWallet: { 
            type: 'file',
            filename: `${logStorage}/threatdb/hacker_wallet/klaytn_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        fetchPhishingUrl: { 
            type: 'file',
            filename: `${logStorage}/threatdb/phishing_url/fetch_rows/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        convertPhishingUrl: { 
            type: 'file',
            filename: `${logStorage}/threatdb/phishing_url/convert_row_to_json/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        ipfsPhishingUrl: { 
            type: 'file',
            filename: `${logStorage}/threatdb/phishing_url/ipfs_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
        klaytnPhishingUrl: { 
            type: 'file',
            filename: `${logStorage}/threatdb/phishing_url/klaytn_upload/${todayYmd}.log`,
            layout: {
                type: 'json',
                separator: ',',
            }
        },
    },
    categories: { 
        default: {
            appenders: ['system'], level: 'debug'
        },
        fetchWafBlackIp: {
            appenders: ['fetchWafBlackIp'], level: 'debug' 
        },
        convertWafBlackIp: {
            appenders: ['convertWafBlackIp'], level: 'debug' 
        },
        ipfsWafBlackIp: {
            appenders: ['ipfsWafBlackIp'], level: 'debug' 
        },
        klaytnWafBlackIp: {
            appenders: ['klaytnWafBlackIp'], level: 'debug' 
        },
        fetchBlackIp: {
            appenders: ['fetchBlackIp'], level: 'debug' 
        },
        convertBlackIp: {
            appenders: ['convertBlackIp'], level: 'debug' 
        },
        ipfsBlackIp: {
            appenders: ['ipfsBlackIp'], level: 'debug' 
        },
        klaytnBlackIp: {
            appenders: ['klaytnBlackIp'], level: 'debug' 
        },
        fetchHackerWallet: {
            appenders: ['fetchHackerWallet'], level: 'debug' 
        },
        convertHackerWallet: {
            appenders: ['convertHackerWallet'], level: 'debug' 
        },
        ipfsHackerWallet: {
            appenders: ['ipfsHackerWallet'], level: 'debug' 
        },
        klaytnHackerWallet: {
            appenders: ['klaytnHackerWallet'], level: 'debug' 
        },
        fetchPhishingUrl: {
            appenders: ['fetchPhishingUrl'], level: 'debug' 
        },
        convertPhishingUrl: {
            appenders: ['convertPhishingUrl'], level: 'debug' 
        },
        ipfsPhishingUrl: {
            appenders: ['ipfsPhishingUrl'], level: 'debug' 
        },
        klaytnPhishingUrl: {
            appenders: ['klaytnPhishingUrl'], level: 'debug' 
        },
    }
});

/**
 * create JSON log data
 * @param {String} status 
 * @param {JSON} metadata 
 * @param {String|JSON} message 
 * @return {JSON}
 */
function getLoggerFormat(status, metadata, message) {
    return {
        status: status,
        metadata: metadata,
        message: message
    }
}

function getLogger(type) {
    if (type == "wafBlackIp") {
        const wafBlackIpLogger = {
            fetch: log4js.getLogger('fetchWafBlackIp'),
            convert: log4js.getLogger('convertWafBlackIp'),
            ipfs: log4js.getLogger('ipfsWafBlackIp'),
            klaytn: log4js.getLogger('klaytnWafBlackIp')
        }
        return wafBlackIpLogger;
    } else if (type == "blackIp") {
        const blackIpLogger = {
            fetch: log4js.getLogger('fetchBlackIp'),
            convert: log4js.getLogger('convertBlackIp'),
            ipfs: log4js.getLogger('ipfsBlackIp'),
            klaytn: log4js.getLogger('klaytnBlackIp')
        }
        return blackIpLogger;
    } else if (type == "hackerWallet") {
        const hackerWalletIpLogger = {
            fetch: log4js.getLogger('fetchHackerWallet'),
            convert: log4js.getLogger('convertHackerWallet'),
            ipfs: log4js.getLogger('ipfsHackerWallet'),
            klaytn: log4js.getLogger('klaytnHackerWallet'),
        }
        return hackerWalletIpLogger;
    } else if (type == "phishingUrl") {
        const phishingUrlLogger = {
            fetch: log4js.getLogger('fetchPhishingUrl'),
            convert: log4js.getLogger('convertPhishingUrl'),
            ipfs: log4js.getLogger('ipfsPhishingUrl'),
            klaytn: log4js.getLogger('klaytnPhishingUrl')
        }
        return phishingUrlLogger;
    } else {
        return false;
    }
}

/**
 * after all logging process finished, should call shutdown
 */
function shutdown() {
    return new Promise((resolve, reject) => {
        log4js.shutdown((error) => {
            if (error)
                reject(error);
            resolve(true);
        });
    });
}

module.exports = {
    getLoggerFormat: getLoggerFormat,
    getLogger: getLogger,
    shutdown: shutdown
}