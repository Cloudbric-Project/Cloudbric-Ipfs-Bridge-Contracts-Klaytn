const path = require('path')

const GAS_LIMIT = 300000
const WORKLOAD = {
    WAF_BLACK_IP: 8000,
    THREAT_DB: 100
}

module.exports = {
    GAS_LIMIT: GAS_LIMIT,
    WORKLOAD: WORKLOAD,
}