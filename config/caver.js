const fs = require('fs');
const path = require('path');
// direcotry path setup
const appDir = path.dirname('index.js');

const caverSecret = fs.readFileSync(`${appDir}/private/.caver.json`).toString();
const vault = JSON.parse(caverSecret);

const Caver = require('caver-js');

const caver = new Caver(vault.cypress.URL);

module.exports = {
    caver: caver,
    vault: vault
}