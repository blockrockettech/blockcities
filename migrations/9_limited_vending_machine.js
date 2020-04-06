const HDWalletProvider = require('truffle-hdwallet-provider');
const { INFURA_KEY } = require('../constants');

const LimitedVendingMachine = artifacts.require('./LimitedVendingMachine.sol');
const BlockCities = artifacts.require('./BlockCities.sol');

const LogicGeneratorV3 = artifacts.require('./LogicGeneratorV3.sol');
const ColourGeneratorV2 = artifacts.require('./ColourGeneratorV2.sol');

module.exports = async function (deployer, network, accounts) {
    const _logicGenerator = await LogicGeneratorV3.deployed();
    const _colourGenerator = await ColourGeneratorV2.deployed();

    const _blockCities = await BlockCities.deployed();

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }

    const buildingMintLimit = 250;
    const preston = "0x64C971d7e3c0483FA97A7714ec55d1E1943731c7";

    // Deploy vending machine
    await deployer.deploy(LimitedVendingMachine,
        _logicGenerator.address,    // randomiser
        _colourGenerator.address,   // randomiser
        _blockCities.address,       // 721
        preston,
        _owner,                                       // BR
        buildingMintLimit,
        0,
        {
            from: _owner
        });

    const _limitedVendingMachine = await LimitedVendingMachine.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_limitedVendingMachine.address, {from: _owner});

    // Whitelist preston
    await _limitedVendingMachine.addWhitelisted(preston, {from: _owner});
};
