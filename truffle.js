const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('./constants');

const mnemonic = process.env.BLOCK_CITIES_MNEMONIC;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;
if (!mnemonic) {
    throw new Error(`
    You are missing a environment variable called BLOCK_CITIES_MNEMONIC - please set one
    e.g. export BLOCK_CITIES_MNEMONIC='<your seed phrase>'
  `);
}

// Check gas prices before live deploy - https://ethgasstation.info/

module.exports = {
    mocha: {
        useColors: true,
    },
    compilers: {
        solc: {
            settings: {
                optimizer: {
                    enabled: true, // Default: false
                    runs: 200      // Default: 200
                },
            }
        }
    },
    networks: {
        development: {
            host: '127.0.0.1',
            port: 7545,
            gas: 6721975, // <-- Use this high gas value
            gasPrice: 1000000000,    // <-- Use this low gas price
            network_id: '*', // Match any network id
        },
        ganache: {
            host: '127.0.0.1',
            port: 7545,
            gas: 6721975, // <-- Use this high gas value
            gasPrice: 1000000000,    // <-- Use this low gas price
            network_id: '*', // Match any network id
        },
        ropsten: {
            provider: function () {
                return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${INFURA_KEY}`);
            },
            network_id: 3,
            gas: 7000000, // default = 4712388
            gasPrice: 10000000000, // default = 100 gwei = 100000000000
            skipDryRun: true
        },
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${INFURA_KEY}`);
            },
            network_id: 4,
            gas: 6500000, // default = 4712388
            gasPrice: 10000000000, // default = 100 gwei = 100000000000
            skipDryRun: true
        },
        live: {
            provider: function () {
                return new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${INFURA_KEY}`);
            },
            network_id: 1,
            gas: 6075039,
            gasPrice: 14110000000, // 14.11
            timeoutBlocks: 200,
            skipDryRun: true
        },
    },
    plugins: [
        'truffle-plugin-verify'
    ],
    verify: {
        preamble: "Author: Blockrocket.tech.\n"
    },
    api_keys: {
        etherscan: ETHERSCAN_KEY
    }
};
