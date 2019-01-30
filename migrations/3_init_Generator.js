const BaseGenerator = artifacts.require('./BaseGenerator.sol');
const BodyGenerator = artifacts.require('./BodyGenerator.sol');
const RoofGenerator = artifacts.require('./RoofGenerator.sol');
const CityGenerator = artifacts.require('./CityGenerator.sol');

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(BaseGenerator, {from: accounts[0]});
    await deployer.deploy(BodyGenerator, {from: accounts[0]});
    await deployer.deploy(RoofGenerator, {from: accounts[0]});
    await deployer.deploy(CityGenerator, {from: accounts[0]});
};
