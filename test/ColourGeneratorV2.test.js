const _ = require('lodash');

const ColourGeneratorV2 = artifacts.require('ColourGeneratorV2');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('ColourGeneratorV2 tests', (accounts) => {

    const other = accounts[2];
    const creator = accounts[1];

    const platform = accounts[3];

    before(async function () {
        this.generator = await ColourGeneratorV2.new(platform, {from: creator});
        await this.generator.updateExteriorPercentages([0, 1, 2], {from: creator});
        await this.generator.updateBackgroundsPercentages([0, 1, 2], {from: creator});
    });

    it('generate me some randoms', async function () {
        for (let i = 0; i < 10; i++) {
            const account = randomAccount();
            console.log(`Generating colours [${i}] for account [${account}]`);
            const {logs} = await this.generator.generate(account);
            console.log(logs);
        }
    });

    context('updateExteriorPercentages', function () {
        it('only owner or platform', async function () {
            await this.generator.updateExteriorPercentages([6], {from: creator});
            let exterior = await this.generator.exteriorPercentages(0);
            exterior.should.be.bignumber.equal(new BN(6));

            await this.generator.updateExteriorPercentages([8], {from: platform});
            exterior = await this.generator.exteriorPercentages(0);
            exterior.should.be.bignumber.equal(new BN(8));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateExteriorPercentages([6], {from: other}));
        });
    });

    context('updateBackgroundsPercentages', function () {
        it('only owner or platform', async function () {
            await this.generator.updateBackgroundsPercentages([6], {from: creator});
            let exterior = await this.generator.backgroundsPercentages(0);
            exterior.should.be.bignumber.equal(new BN(6));

            await this.generator.updateBackgroundsPercentages([8], {from: platform});
            exterior = await this.generator.backgroundsPercentages(0);
            exterior.should.be.bignumber.equal(new BN(8));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateBackgroundsPercentages([6], {from: other}));
        });
    });

    function randomAccount () {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
