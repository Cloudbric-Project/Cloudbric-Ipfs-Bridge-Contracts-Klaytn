const fs = require('fs');

const secret = fs.readFileSync(".secret.json").toString();
const parsedSecret = JSON.parse(secret);

module.exports = {
    vault: parsedSecret
}