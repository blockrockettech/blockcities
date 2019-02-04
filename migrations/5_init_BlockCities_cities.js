let BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    const _blockCities = await BlockCities.deployed();

    // Note: these cities must also be inside CityGenerator for them to be chosen/used

    await _blockCities.addCity(web3.utils.fromAscii("San Francisco"), {from: accounts[0]});
    await _blockCities.addCity(web3.utils.fromAscii("Atlanta"), {from: accounts[0]});
    await _blockCities.addCity(web3.utils.fromAscii("Chicago"), {from: accounts[0]});
    await _blockCities.addCity(web3.utils.fromAscii("New York City"), {from: accounts[0]});
};
