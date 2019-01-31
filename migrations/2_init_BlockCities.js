let BlockCities = artifacts.require('./BlockCities.sol');

module.exports = async function (deployer, network, accounts) {
    let tokenBaseURI = "http://localhost:5000/block-cities/us-central1/api/network/5777";

    // Assume all is live network unless specified
    if (network === 'live') {
        tokenBaseURI = "http://localhost:5000/block-cities/us-central1/api";
    } else if (network === 'ropsten') {
        tokenBaseURI = "http://localhost:5000/block-cities/us-central1/api/network/3";
    } else if (network === 'rinkeby') {
        tokenBaseURI = "http://localhost:5000/block-cities/us-central1/api/network/4";
    }

    await deployer.deploy(BlockCities, tokenBaseURI, {from: accounts[0]});
};
