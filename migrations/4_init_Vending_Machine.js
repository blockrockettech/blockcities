const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');
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

    // Deploy vending machine
    await deployer.deploy(
        BlockCitiesVendingMachine,
        _logicGenerator.address,
        _colourGenerator.address,
        _blockCities.address,
        {
            from: _owner
        });

    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_blockCitiesVendingMachine.address, {from: _owner});
};
