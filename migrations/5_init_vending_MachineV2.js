const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const BlockCitiesVendingMachineV2 = artifacts.require('./BlockCitiesVendingMachineV2.sol');
const BlockCities = artifacts.require('./BlockCities.sol');

const ColourGenerator = artifacts.require('./ColourGenerator.sol');
const LogicGenerator = artifacts.require('./LogicGenerator.sol');

module.exports = async function (deployer, network, accounts) {
    const _logicGenerator = await LogicGenerator.deployed();
    const _colourGenerator = await ColourGenerator.deployed();

    const _blockCities = await BlockCities.deployed();

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }

    // Deploy vending machine
    await deployer.deploy(BlockCitiesVendingMachineV2,
        _logicGenerator.address,    // randomiser
        _colourGenerator.address,   // randomiser
        _blockCities.address,       // 721
        "0x64C971d7e3c0483FA97A7714ec55d1E1943731c7", // Preseton
        _owner,                                       // BR
        {
            from: _owner
        });

    const _blockCitiesVendingMachineV2 = await BlockCitiesVendingMachineV2.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_blockCitiesVendingMachineV2.address, {from: _owner});
};
