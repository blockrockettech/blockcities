const _ = require('lodash');

const ColourGenerator = artifacts.require('ColourGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('ColourGenerator tests', (accounts) => {

    const other = accounts[2];
    const creator = accounts[1];

    before(async function () {
        this.generator = await ColourGenerator.new({from: creator});
    });

    it('generate me some randoms', async function () {
        for (let i = 0; i < 50; i++) {
            const account = randomAccount();
            console.log(`Generating colours [${i}] for account [${account}]`);
            const {logs} = await this.generator.generate(account);
            console.log(logs);
        }
    });

    context('updateExteriors', function () {
        it('only owner ', async function () {
            await this.generator.updateExteriors(33, {from: creator});
            const exteriors = await this.generator.exteriors();
            exteriors.should.be.bignumber.equal(new BN(33));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateExteriors(1, {from: other}));
        });
    });

    context('updateBackgrounds', function () {
        it('only owner ', async function () {
            await this.generator.updateBackgrounds(33, {from: creator});
            const backgrounds = await this.generator.backgrounds();
            backgrounds.should.be.bignumber.equal(new BN(33));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateBackgrounds(1, {from: other}));
        });
    });

    function randomAccount () {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
