let BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    const _blockCities = await BlockCities.deployed();
    await _blockCities.addCity(web3.utils.fromAscii("Atlanta"), {from:accounts[0]});
};
