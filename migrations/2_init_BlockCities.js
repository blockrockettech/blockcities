const BlockCities = artifacts.require('./BlockCities.sol');
const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '8d878f1ce20b4e2fa9eea01668281193';

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(require('../mnemonic'), `https://${network}.infura.io/v3/${infuraApikey}`, 0).getAddress();
    }

    let tokenBaseURI = "http://localhost:5000/block-cities/us-central1/api/network/5777";

    // Assume all is live network unless specified
    if (network === 'live') {
        tokenBaseURI = "https://us-central1-block-cities.cloudfunctions.net/api/network/1";
    } else if (network === 'ropsten') {
        tokenBaseURI = "https://us-central1-block-cities.cloudfunctions.net/api/network/3";
    } else if (network === 'rinkeby') {
        tokenBaseURI = "https://us-central1-block-cities.cloudfunctions.net/api/network/4";
    }

    await deployer.deploy(BlockCities, tokenBaseURI, {from: _owner});
};
