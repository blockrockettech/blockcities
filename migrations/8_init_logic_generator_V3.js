const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const LogicGeneratorV3 = artifacts.require('./LogicGeneratorV3.sol');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }

    // ensure BC can change the percentage config - so pass partner address in
    // we are deployer (via _owner) have access to change params too!
    await deployer.deploy(LogicGeneratorV3, '0x64C971d7e3c0483FA97A7714ec55d1E1943731c7', {from: _owner});
};
