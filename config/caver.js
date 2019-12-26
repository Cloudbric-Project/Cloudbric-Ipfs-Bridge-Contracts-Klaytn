const fs = require('fs')
const path = require('path')
const APP_ROOT_DIR = path.join(__dirname, '..')

const caverSecret = fs.readFileSync(path.join(APP_ROOT_DIR, '/private/.caver.json')).toString()
const vault = JSON.parse(caverSecret)

const Caver = require('caver-js')

// Use Mainnet Cypress
const caver = new Caver(vault.cypress.URL)

module.exports = {
    caver: caver,
    vault: vault
}