const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

module.exports = async function (deployer, network, accounts) {
    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    console.log(_blockCitiesVendingMachine);

    let _owner = accounts[0];

    console.log(_owner);

    // Add some credit for each account
    await _blockCitiesVendingMachine.addCredit(_owner, {from: _owner});

    // Mint 5 random buildings
    await _blockCitiesVendingMachine.mintBuilding({from: _owner});
};
