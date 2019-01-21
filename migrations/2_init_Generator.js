let Generator = artifacts.require('./Generator.sol');

module.exports = function (deployer) {
    deployer.deploy(Generator);
};
