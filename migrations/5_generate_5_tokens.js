const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');

module.exports = async function (deployer, network, accounts) {
    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    let _owner = accounts[0];
    let _buyer = accounts[1];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        const PROVIDER_URL = `https://${network}.infura.io/v3/${INFURA_KEY}`;
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, PROVIDER_URL, 0).getAddress();
        _buyer = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, PROVIDER_URL, 1, 2).getAddress();
    }

    // // Add some credit for each account
    await _blockCitiesVendingMachine.addCredit(_buyer, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_buyer, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_buyer, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_buyer, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_buyer, {from: _owner});

    // // Mint 5 random buildings
    await _blockCitiesVendingMachine.mintBuilding({from: _buyer});
    await _blockCitiesVendingMachine.mintBuilding({from: _buyer});
    await _blockCitiesVendingMachine.mintBuilding({from: _buyer});
    await _blockCitiesVendingMachine.mintBuilding({from: _buyer});
    await _blockCitiesVendingMachine.mintBuilding({from: _buyer});
};
