const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

module.exports = async function (deployer, network, accounts) {
    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    let _owner = accounts[0];

    // // Add some credit for each account
    // await _blockCitiesVendingMachine.addCredit(accounts[1], {from: _owner});
    // await _blockCitiesVendingMachine.addCredit(accounts[2], {from: _owner});
    // await _blockCitiesVendingMachine.addCredit(accounts[3], {from: _owner});
    // await _blockCitiesVendingMachine.addCredit(accounts[4], {from: _owner});
    // await _blockCitiesVendingMachine.addCredit(accounts[5], {from: _owner});
    //
    // // Mint 5 random buildings
    // await _blockCitiesVendingMachine.mintBuilding({from: accounts[1]});
    // await _blockCitiesVendingMachine.mintBuilding({from: accounts[2]});
    // await _blockCitiesVendingMachine.mintBuilding({from: accounts[3]});
    // await _blockCitiesVendingMachine.mintBuilding({from: accounts[4]});


    for (let i = 0; i < 50; i++) {
        await _blockCitiesVendingMachine.addCredit(accounts[1], {from: _owner});
        await _blockCitiesVendingMachine.mintBuilding({from: accounts[1]});
    }
};
