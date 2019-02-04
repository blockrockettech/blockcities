const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');
const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

module.exports = async function (deployer, network, accounts) {
    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    let _owner = accounts[0];
    let _buyer = accounts[1];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'rinkeby') {
        const PROVIDER_URL = `https://${network}.infura.io/v3/${infuraApikey}`;
        _owner = new HDWalletProvider(require('../mnemonic'), PROVIDER_URL, 0).getAddress();
        _buyer = new HDWalletProvider(require('../mnemonic'), PROVIDER_URL, 1).getAddress();
    }

    console.log("_owner", _owner);
    console.log("_buyer", _buyer);

    // // Add some credit for each account
    await _blockCitiesVendingMachine.addCredit(_owner, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_owner, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_owner, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_owner, {from: _owner});
    await _blockCitiesVendingMachine.addCredit(_owner, {from: _owner});

    // // Mint 5 random buildings
    await _blockCitiesVendingMachine.mintBuilding({from: _owner});
    await _blockCitiesVendingMachine.mintBuilding({from: _owner});
    await _blockCitiesVendingMachine.mintBuilding({from: _owner});
    await _blockCitiesVendingMachine.mintBuilding({from: _owner});
    await _blockCitiesVendingMachine.mintBuilding({from: _owner});
};
