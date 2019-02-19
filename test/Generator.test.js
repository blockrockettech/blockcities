const _ = require('lodash');

const BodyGenerator = artifacts.require('BodyGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('Generator tests', (accounts) => {

    before(async function () {
        this.generator = await BodyGenerator.new({from: accounts[0]});
    });

    it('generate me some randoms', async function () {
        const results = {};
        for (let i = 0; i < 100; i++) {

            const {logs} = await this.generator.generate(0, randomAccount());

            const {id, weight, random} = logs[0].args;
            // console.log(`matched id=[${id}] weight=[${weight}] random=[${random}]`);
            console.log(logs[0].args[0].toNumber());
        }
    });


    function randomAccount() {
        // Random account between 0-9 (10 accounts)
        return accounts[Math.floor(Math.random() * Math.floor(9))];
    }
});
