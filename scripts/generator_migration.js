const _ = require('lodash');
const Web3 = require('web3');
const program = require('commander');
const HDWalletProvider = require('truffle-hdwallet-provider');

const LogicGenerator = require('../build/contracts/LogicGenerator');

const {INFURA_KEY} = require('../constants');

const {gas, gasPrice} = {gas: 6721975, gasPrice: '7000000000'};
console.log(`gas=${gas} | gasPrice=${gasPrice}`);

// FIXME generic way of picking this up
const logic_generator_migration_1 = require('./data/logic_generator_migration_1');

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

    const LOGIC_GENERATOR_ABI = LogicGenerator.abi;
    const LOGIC_GENERATOR_ADDRESS = LogicGenerator.networks[_.toString(program.network)].address;
    if (!LOGIC_GENERATOR_ADDRESS || !LOGIC_GENERATOR_ABI) {
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

    const LogicGeneratorContract = new web3.eth.Contract(LOGIC_GENERATOR_ABI, LOGIC_GENERATOR_ADDRESS);

    // ////////////////////////
    // // Buildings Mappings //
    // ////////////////////////
    const buildingsConfig = logic_generator_migration_1.data.buildings;

    // BASE
    const buildingBasePromises = _.map(buildingsConfig, ({base, body, roof}, building) => {
        if (base) {
            console.log(`Adding building [${building}] base [${base}]`);
            return new Promise((resolve, reject) => {
                web3.eth
                    .sendTransaction({
                        from: fromAccount,
                        to: LOGIC_GENERATOR_ADDRESS,
                        data: LogicGeneratorContract.methods.updateBuildingBaseMappings(building, base).encodeABI(),
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
        }

        return Promise.resolve(`Skipped no BASE for #${building}`);
    });

    // BODY
    const buildingBodyPromises = _.map(buildingsConfig, ({base, body, roof}, building) => {
        if (body) {
            console.log(`Adding building [${building}] body [${base}]`);
            return new Promise((resolve, reject) => {
                web3.eth
                    .sendTransaction({
                        from: fromAccount,
                        to: LOGIC_GENERATOR_ADDRESS,
                        data: LogicGeneratorContract.methods.updateBuildingBodyMappings(building, body).encodeABI(),
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
        }

        return Promise.resolve(`Skipped no BODY for #${building}`);
    });

    // ROOF
    const buildingRoofPromises = _.map(buildingsConfig, ({base, body, roof}, building) => {
        if (roof) {
            console.log(`Adding building [${building}] roof [${roof}]`);
            return new Promise((resolve, reject) => {
                web3.eth
                    .sendTransaction({
                        from: fromAccount,
                        to: LOGIC_GENERATOR_ADDRESS,
                        data: LogicGeneratorContract.methods.updateBuildingRoofMappings(building, roof).encodeABI(),
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
        }

        return Promise.resolve(`Skipped no ROOF for #${building}`);
    });

    /////////////////////
    // Wait and Output //
    /////////////////////

    const promises = [
        ...buildingBasePromises, // DONE
        ...buildingBodyPromises, // DONE
        ...buildingRoofPromises // DONE
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
