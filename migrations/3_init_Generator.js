let Generator = artifacts.require('./Generator.sol');
let CityGenerator = artifacts.require('./CityGenerator.sol');

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(Generator, {from: accounts[0]});
    await deployer.deploy(CityGenerator, {from: accounts[0]});
};
