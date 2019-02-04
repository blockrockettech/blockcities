const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');
const BlockCities = artifacts.require('./BlockCities.sol');

const BaseGenerator = artifacts.require('./BaseGenerator.sol');
const BodyGenerator = artifacts.require('./BodyGenerator.sol');
const RoofGenerator = artifacts.require('./RoofGenerator.sol');
const CityGenerator = artifacts.require('./CityGenerator.sol');

module.exports = async function (deployer, network, accounts) {
    const _cityGenerator = await CityGenerator.deployed();
    const _baseGenerator = await BaseGenerator.deployed();
    const _boydGenerator = await BodyGenerator.deployed();
    const _roofGenerator = await RoofGenerator.deployed();

    const _blockCities = await BlockCities.deployed();

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(require('../mnemonic'), `https://${network}.infura.io/v3/${infuraApikey}`, 0).getAddress();
    }

    // Deploy vending machine
    await deployer.deploy(
        BlockCitiesVendingMachine,
        _cityGenerator.address,
        _baseGenerator.address,
        _boydGenerator.address,
        _roofGenerator.address,
        _blockCities.address,
        {
            from: _owner
        });

    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_blockCitiesVendingMachine.address, {from: _owner});
};
