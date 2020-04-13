const HDWalletProvider = require('truffle-hdwallet-provider');
const {INFURA_KEY} = require('../constants');

const CityBuildingValidator = artifacts.require('./CityBuildingValidator.sol');
const LimitedVendingMachine = artifacts.require('./LimitedVendingMachine.sol');

module.exports = async function (deployer, network, accounts) {

    let _owner = accounts[0];

    // Load in other accounts for different networks
    if (network === 'ropsten' || network === 'ropsten-fork' || network === 'rinkeby' || network === 'rinkeby-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://${network}.infura.io/v3/${INFURA_KEY}`, 0).getAddress();
    }

    if (network === 'live' || network === 'live-fork') {
        _owner = new HDWalletProvider(process.env.BLOCK_CITIES_MNEMONIC, `https://mainnet.infura.io/${INFURA_KEY}`, 0).getAddress();
    }

    const city = 1;
    const buildingMintLimit = 250;
    const preston = "0x64C971d7e3c0483FA97A7714ec55d1E1943731c7";

    await deployer.deploy(CityBuildingValidator, preston, city, {from: _owner});

    console.log(`CityBuildingValidator address ${CityBuildingValidator.address}`);

    // Deploy vending machine
    await deployer.deploy(LimitedVendingMachine,
        "0x2f2d5aA0EfDB9Ca3C9bB789693d06BEBEa88792F",       // 721 MAINNET
        CityBuildingValidator.address,
        preston,
        _owner,                                       // BR
        buildingMintLimit,
        city, // city
        {
            from: _owner
        });

    console.log(`LimitedVendingMachine address ${LimitedVendingMachine.address}`);

    // const _limitedVendingMachine = await LimitedVendingMachine.deployed();

    // // Whitelist vending machine in the core contract
    // await _blockCities.addWhitelisted(_limitedVendingMachine.address, {from: _owner});
    //
    // // Whitelist preston
    // await _limitedVendingMachine.addWhitelisted(preston, {from: _owner});
};
