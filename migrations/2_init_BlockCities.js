const BlockCities = artifacts.require('./BlockCities.sol');
const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    let tokenBaseURI = "http://localhost:5000/block-cities/us-central1/api/network/5777/token/";

    // Assume all is live network unless specified
    if (network === 'live') {
        tokenBaseURI = "https://us-central1-block-cities.cloudfunctions.net/api/network/1/token/";
    } else if (network === 'ropsten') {
        tokenBaseURI = "https://us-central1-block-cities.cloudfunctions.net/api/network/3/token/";
    } else if (network === 'rinkeby') {
        tokenBaseURI = "https://us-central1-block-cities.cloudfunctions.net/api/network/4/token/";
    }

    console.log(`Deploying BlockCities contract with token base URI [${tokenBaseURI}]`);

    await deployer.deploy(BlockCities, tokenBaseURI, {from: _owner});
};
