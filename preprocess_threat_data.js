const log4js = require('log4js');
const labsdb = require('./db/labsdb');

const threatdb = new labsdb('threatdb');
// 1. make result of query data to json file.
// 2. then upload file to ipfs.
// 3. write log db.

threatdb.query('SELECT * FROM td_phishing_url_detail LIMIT 2')
    .then(rows => {
        console.log(rows.length); 
        jsonRow = JSON.stringify(rows[0]);
        parsed = JSON.parse(jsonRow);
        console.log(parsed);
    }).catch(error => {
        console.log(error);
    })

