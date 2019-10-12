const fs = require('fs');
const caverSecret = fs.readFileSync(`${__dirname}/../private/.caver.json`).toString();
const vault = JSON.parse(caverSecret);

const Caver = require('caver-js');

const caver = new Caver(vault.cypress.URL);

module.exports = {
    caver: caver,
    vault: vault
}