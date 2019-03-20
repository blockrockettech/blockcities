const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

const ColourGenerator = artifacts.require('./ColourGenerator.sol');
const LogicGenerator = artifacts.require('./LogicGenerator.sol');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(require('../mnemonic'), `https://${network}.infura.io/v3/${infuraApikey}`, 0).getAddress();
    }

    await deployer.deploy(ColourGenerator, {from: _owner});
    await deployer.deploy(LogicGenerator, {from: _owner});
};
