const HDWalletProvider = require('truffle-hdwallet-provider-klaytn');

const path = require('path');
// direcotry path setup
const appDir = path.dirname('index.js');
const caverConfig = require(`${appDir}/config/caver`);
const vault = caverConfig.vault;

const LOCAL_NETWORK_ID = '1001';
const LOCAL_DEPLOYER = vault.local.accounts.deployer;
const LOCAL_URL = vault.local.URL;

const BAOBAB_NETWORK_ID = '1001';
const BAOBAB_DEPLOYER = vault.baobab.accounts.deployer;
const BAOBAB_URL = vault.baobab.URL;

const CYPRESS_NETWORK_ID = '8217';
const CYPRESS_DEPLOYER = vault.cypress.accounts.deployer;
const CYPRESS_URL = vault.cypress.URL;
const CYPRESS_PUBLIC_EN_URL = vault.cypressPublicEN.URL;

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
    
    cypressPublicEN: {
      provider: () => new HDWalletProvider(CYPRESS_DEPLOYER.privateKey, CYPRESS_PUBLIC_EN_URL),
      network_id: CYPRESS_NETWORK_ID,
      gas: '8500000',
      gasPrice: null,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
    useColors: true
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.4.24",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
}
