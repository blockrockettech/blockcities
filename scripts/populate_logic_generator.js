const _ = require('lodash');
const program = require('commander');

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

    //////////////////////
    // END : Setup Args //
    //////////////////////

    const networkString = getNetwork(program.network);
    console.log(`Running on network [${networkString}][${program.network}]`);


    const LOGIC_GENERATOR_ABI = require('../build/contracts/BlockCitiesVendingMachine').abi;
    const LOGIC_GENERATOR_ADDRESS = require('../build/contracts/BlockCitiesVendingMachine').networks[_.toString(program.network)].address;

    const LogicGeneratorContract = new web3.eth.Contract(LOGIC_GENERATOR_ABI, LOGIC_GENERATOR_ADDRESS);


    // TODO
    // load account from see in web3
    // load contract in web3
    // load network
    // load csv for each section
    // validate
    // fire in multiple requests as once

}();

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
