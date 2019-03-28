const _ = require('lodash');

const LogicGenerator = artifacts.require('LogicGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('LogicGenerator tests', (accounts) => {

    before(async function () {
        console.log(accounts);
        this.generator = await LogicGenerator.new({from: accounts[0]});
    });

    it('generate me some randoms', async function () {
        for (let i = 0; i < 10; i++) {
            const {logs} = await this.generator.generate(randomAccount());
            // console.log(logs);
        }
    });

    function randomAccount() {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
