const HDWalletProvider = require('truffle-hdwallet-provider');
const { INFURA_KEY } = require('../constants');

const CityBuildingValidator = artifacts.require('./CityBuildingValidator.sol');
const LimitedVendingMachine = artifacts.require('./LimitedVendingMachine.sol');
const BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    const _blockCities = await BlockCities.deployed();

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }

    const city = 0;
    const buildingMintLimit = 250;
    const preston = "0x64C971d7e3c0483FA97A7714ec55d1E1943731c7";

    await deployer.deploy(CityBuildingValidator, preston, city, {from: _owner});

    // Deploy vending machine
    await deployer.deploy(LimitedVendingMachine,
        _blockCities.address,       // 721
        CityBuildingValidator.address,
        preston,
        _owner,                                       // BR
        buildingMintLimit,
        city, // city
        {
            from: _owner
        });

    const _limitedVendingMachine = await LimitedVendingMachine.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_limitedVendingMachine.address, {from: _owner});

    // Whitelist preston
    await _limitedVendingMachine.addWhitelisted(preston, {from: _owner});
};
