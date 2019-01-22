let Generator = artifacts.require('./Generator.sol');

module.exports = function (deployer, network, accounts) {
    deployer.deploy(Generator, {from:accounts[0]});
};
