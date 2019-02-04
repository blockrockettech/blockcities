const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');

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

    for (let i = 0; i < 200; i++) {
        await _blockCitiesVendingMachine.addCredit(accounts[1], {from: _owner});
        await _blockCitiesVendingMachine.mintBuilding({from: accounts[1]});
    }
};
