const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const BlockCitiesVendingMachineV2 = artifacts.require('./BlockCitiesVendingMachineV2.sol');
const LogicGeneratorV3 = artifacts.require('./LogicGeneratorV3.sol');
const ColourGeneratorV2 = artifacts.require('./ColourGeneratorV2.sol');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }


    const _blockCitiesVendingMachineV2 = await BlockCitiesVendingMachineV2.deployed();
    const _colourGeneratorV2 = await ColourGeneratorV2.deployed();
    const _logicGeneratorV3 = await LogicGeneratorV3.deployed();


    await _blockCitiesVendingMachineV2.setColourGenerator(_colourGeneratorV2.address, {from: _owner});
    await _blockCitiesVendingMachineV2.setLogicGenerator(_logicGeneratorV3.address, {from: _owner});
};
