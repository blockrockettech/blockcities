let Generator = artifacts.require('./Generator.sol');
let BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');
let BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    const _generator = await Generator.deployed();
    const _blockCities = await BlockCities.deployed();

    // Deploy vending machine
    await deployer.deploy(BlockCitiesVendingMachine, _generator.address, _blockCities.address, {from: accounts[0]});

    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_blockCitiesVendingMachine.address, {from: accounts[0]});
};
