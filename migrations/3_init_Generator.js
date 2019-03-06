const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

const BaseGenerator = artifacts.require('./BaseGenerator.sol');
const BodyGenerator = artifacts.require('./BodyGenerator.sol');
const RoofGenerator = artifacts.require('./RoofGenerator.sol');
const BuildingGenerator = artifacts.require('./BuildingGenerator.sol');
const SpecialGenerator = artifacts.require('./SpecialGenerator.sol');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(require('../mnemonic'), `https://${network}.infura.io/v3/${infuraApikey}`, 0).getAddress();
    }

    await deployer.deploy(BaseGenerator, {from: _owner});
    await deployer.deploy(BodyGenerator, {from: _owner});
    await deployer.deploy(RoofGenerator, {from: _owner});
    await deployer.deploy(BuildingGenerator, {from: _owner});
    await deployer.deploy(SpecialGenerator, {from: _owner});
};
