const fs = require('fs');
const helper = require(`${__dirname}/../../helper/helper`);
const pushq = require(`${__dirname}/../../helper/pushq`);

/**
 * fetch rows from brdaily table from starting point(last inserted index + 1)
 * @param {Object} schema
 * @param {String} query
 * @return {Array.<Object>} rows which contains row of threat data
 */
async function fetchRows(schema, fetchQueryFromStartingIdx) {
    let rows = null;
    try {
        console.log(`fetch rows from start idx`);
        rows = await schema.query(fetchQueryFromStartingIdx);
        return rows;
    } catch (error) {
        const message = helper.createErrorMessage('fetch rows from table', __filename);
        pushq.sendMessage(message);
        throw new Error(error);
    }
}

/**
 * convert each row to .json file in /data/waf_black_ip directory.
 * @param {Array.<Object>} rows which contains row of threat data
 */
async function convertRowToJSON(rows, dataStorage) {
    rows.forEach((row) => {
        let rowJsonString = JSON.stringify(row);
        let parsedRow = JSON.parse(rowJsonString);
        try {
            fs.writeFileSync(`${dataStorage}/${parsedRow.idx}.json`, rowJsonString);
        } catch (error) {
            const message = helper.createErrorMessage('convert row to JSON', __filename);
            pushq.sendMessage(message);
            throw new Error(error);
        }
    });
    console.log(`convert Row To JSON is ended`);
}

module.exports = {
    fetchRows: fetchRows,
    convertRowToJSON: convertRowToJSON
}