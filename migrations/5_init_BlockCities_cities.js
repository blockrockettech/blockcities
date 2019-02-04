const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

const BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    const _blockCities = await BlockCities.deployed();

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(require('../mnemonic'), `https://${network}.infura.io/v3/${infuraApikey}`, 0).getAddress();
    }

    // Note: these cities must also be inside CityGenerator for them to be chosen/used
    await _blockCities.addCity(web3.utils.fromAscii("San Francisco"), {from: _owner});
    await _blockCities.addCity(web3.utils.fromAscii("Atlanta"), {from: _owner});
    await _blockCities.addCity(web3.utils.fromAscii("Chicago"), {from: _owner});
    await _blockCities.addCity(web3.utils.fromAscii("New York City"), {from: _owner});
};
