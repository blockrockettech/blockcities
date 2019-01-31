const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');

module.exports = async function (deployer, network, accounts) {
    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    // Add some credit for each account
    await _blockCitiesVendingMachine.addCredit(accounts[1], {from: accounts[0]});
    await _blockCitiesVendingMachine.addCredit(accounts[2], {from: accounts[0]});
    await _blockCitiesVendingMachine.addCredit(accounts[3], {from: accounts[0]});
    await _blockCitiesVendingMachine.addCredit(accounts[4], {from: accounts[0]});
    await _blockCitiesVendingMachine.addCredit(accounts[5], {from: accounts[0]});

    // Mint 5 random buildings
    await _blockCitiesVendingMachine.mintBuilding({from: accounts[1]});
    await _blockCitiesVendingMachine.mintBuilding({from: accounts[2]});
    await _blockCitiesVendingMachine.mintBuilding({from: accounts[3]});
    await _blockCitiesVendingMachine.mintBuilding({from: accounts[4]});
    await _blockCitiesVendingMachine.mintBuilding({from: accounts[5]});
};
