const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const ColourGenerator = artifacts.require('./ColourGenerator.sol');
const LogicGenerator = artifacts.require('./LogicGenerator.sol');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }

    await deployer.deploy(ColourGenerator, {from: _owner});
    await deployer.deploy(LogicGenerator, {from: _owner});
};
