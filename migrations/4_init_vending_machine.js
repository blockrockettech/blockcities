const BlockCitiesVendingMachine = artifacts.require('./BlockCitiesVendingMachine.sol');
const BlockCities = artifacts.require('./BlockCities.sol');

const BaseGenerator = artifacts.require('./BaseGenerator.sol');
const BodyGenerator = artifacts.require('./BodyGenerator.sol');
const RoofGenerator = artifacts.require('./RoofGenerator.sol');
const CityGenerator = artifacts.require('./CityGenerator.sol');

module.exports = async function (deployer, network, accounts) {
    const _cityGenerator = await CityGenerator.deployed();
    const _baseGenerator = await BaseGenerator.deployed();
    const _boydGenerator = await BodyGenerator.deployed();
    const _roofGenerator = await RoofGenerator.deployed();

    const _blockCities = await BlockCities.deployed();

    // Deploy vending machine
    await deployer.deploy(
        BlockCitiesVendingMachine,
        _cityGenerator.address,
        _baseGenerator.address,
        _boydGenerator.address,
        _roofGenerator.address,
        _blockCities.address,
        {
            from: accounts[0]
        });

    const _blockCitiesVendingMachine = await BlockCitiesVendingMachine.deployed();

    // Whitelist vending machine in the core contract
    await _blockCities.addWhitelisted(_blockCitiesVendingMachine.address, {from: accounts[0]});
};
