let BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(BlockCities, {from: accounts[0]});
};
