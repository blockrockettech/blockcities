let Generator = artifacts.require('./Generator.sol');
let BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer) {
    const _generator = await Generator.deployed();
    deployer.deploy(BlockCities, _generator.address);
};
