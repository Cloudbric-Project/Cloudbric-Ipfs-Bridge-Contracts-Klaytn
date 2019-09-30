const Caver = require('caver-js');
const secret = require('./secret');
const vault = secret.vault;

const caver = new Caver(vault.local.URL);

module.exports = {
    caver: caver
}