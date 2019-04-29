const _ = require('lodash');
const Web3 = require('web3');
const program = require('commander');
const HDWalletProvider = require('truffle-hdwallet-provider');

const BlockCities = require('../build/contracts/BlockCities');

const {INFURA_KEY} = require('../constants');

const {gas, gasPrice} = {gas: 6721975, gasPrice: '7000000000'};
console.log(`gas=${gas} | gasPrice=${gasPrice}`);

const foundersList = require('./data/founders-list');

function getHttpProviderUri (network) {
    if (network === 'local') {
        return 'HTTP://127.0.0.1:7545';
    }
    return `https://${network}.infura.io/v3/${INFURA_KEY}`;
}

const getNetwork = (network) => {
    return networkSplitter(network, {
        mainnet: 'mainnet',
        ropsten: 'ropsten',
        rinkeby: 'rinkeby',
        local: 'local'
    });
};

const networkSplitter = (network, {ropsten, rinkeby, mainnet, local}) => {
    switch (network) {
        case 1:
        case '1':
        case 'mainnet':
            return mainnet;
        case 3:
        case '3':
        case 'ropsten':
            return ropsten;
        case 4:
        case '4':
        case 'rinkeby':
            return rinkeby;
        case 5777:
        case '5777':
        case 'local':
            // This may change if a clean deploy of KODA locally is not done
            return local;
        default:
            throw new Error(`Unknown network ID ${network}`);
    }
};

void async function () {
    ////////////////////////
    // START : Setup Args //
    ////////////////////////

    program
        .option('-n, --network <n>', 'Network - either 1,3,4,5777', parseInt)
        .parse(process.argv);

    if (!program.network) {
        console.log(`Please specify --network=1, 3, 4 or 5777`);
        process.exit();
    }

    const networkString = getNetwork(program.network);
    console.log(`Running on network [${networkString}][${program.network}]`);

    const mnemonic = process.env.BLOCK_CITIES_MNEMONIC;
    if (!mnemonic) {
        throw new Error(`Error missing BLOCK_CITIES_MNEMONIC`);
    }

    const BLOCKCITIES_ABI = BlockCities.abi;
    const BLOCKCITIES_ADDRESS = BlockCities.networks[_.toString(program.network)].address;
    if (!BLOCKCITIES_ABI || !BLOCKCITIES_ADDRESS) {
        throw new Error(`Missing ABI or Address for logic generator`);
    }

    //////////////////////
    // END : Setup Args //
    //////////////////////

    const httpProviderUrl = getHttpProviderUri(networkString);

    const provider = new HDWalletProvider(mnemonic, httpProviderUrl, 0);
    const fromAccount = provider.getAddress();

    const web3 = new Web3(provider);

    const failures = [];
    const successes = [];

    let startingNonce = await web3.eth.getTransactionCount(fromAccount);
    console.log(`Using account [${fromAccount}] with starting nonce [${startingNonce}]`);

    const BlockCitiesContract = new web3.eth.Contract(BLOCKCITIES_ABI, BLOCKCITIES_ADDRESS);

    const FOUNDERS_BUILDING_ID = 1000008;

    const buildingPromises = _.map(foundersList, (acc) => {

        console.log(`Minting founders building [${FOUNDERS_BUILDING_ID}] to [${acc}]`);
        return new Promise((resolve, reject) => {
            web3.eth
                .sendTransaction({
                    from: fromAccount,
                    to: BLOCKCITIES_ADDRESS,
                    data: BlockCitiesContract.methods.createBuilding(
                        0,
                        6, // BOLD BLUE
                        0,
                        0,
                        0,
                        0,
                        0,
                        FOUNDERS_BUILDING_ID,
                        acc
                    ).encodeABI(),
                    gas: gas,
                    gasPrice: gasPrice,
                    nonce: startingNonce
                })
                .once('transactionHash', function (hash) {
                    successes.push(hash);
                    resolve(hash);
                })
                .catch((e) => {
                    failures.push({error: e});
                    reject(e);
                });

            startingNonce++;
        });

    });

    /////////////////////
    // Wait and Output //
    /////////////////////

    const promises = [
        ...buildingPromises, // DONE
    ];
    console.log(promises);

    await Promise.all(promises)
        .then((rawTransactions) => {

            console.log(`
            Submitted transactions
              - Success [${successes.length}]
              - Failures [${failures.length}]
            `);

            console.log(rawTransactions);

            process.exit();
        })
        .catch((error) => {
            console.log('FAILURE', error);
        });

}();
