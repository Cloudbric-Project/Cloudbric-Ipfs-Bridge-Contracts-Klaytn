const HDWalletProvider = require('truffle-hdwallet-provider-klaytn');
const fs = require('fs');

const secret = fs.readFileSync(".secret.json").toString();
const parsedSecret = JSON.parse(secret);

const LOCAL_NETWORK_ID = '1001';
const LOCAL_DEPLOYER = parsedSecret.local.deployer;
const LOCAL_URL = parsedSecret.local.URL;

const BAOBAB_NETWORK_ID = '1001';
const BAOBAB_DEPLOYER = parsedSecret.baobab.deployer;
const BAOBAB_URL = parsedSecret.URL;

const CYPRESS_NETWORK_ID = '8217';
const CYPRESS_DEPLOYER = parsedSecret.cypress.deployer;
const CYPRESS_URL = parsedSecret.URL;

module.exports = {
  networks: {
    development: {
      provider: () => new HDWalletProvider(LOCAL_DEPLOYER.privateKey, LOCAL_URL),
      network_id: LOCAL_NETWORK_ID,
      gas: '8500000',
      gasPrice: null,
    },

    baobab: {
      provider: () => new HDWalletProvider(BAOBAB_DEPLOYER.privateKey, BAOBAB_URL),
      network_id: BAOBAB_NETWORK_ID,
      gas: '8500000',
      gasPrice: null,
    },

    cypress: {
      provider: () => new HDWalletProvider(CYPRESS_DEPLOYER.privateKey, CYPRESS_URL),
      network_id: CYPRESS_NETWORK_ID,
      gas: '8500000',
      gasPrice: null,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.4.24",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
}
