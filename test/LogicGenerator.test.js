const _ = require('lodash');

const LogicGenerator = artifacts.require('LogicGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('LogicGenerator tests', ([_, creator, other, ...accounts]) => {

    before(async function () {
        this.generator = await LogicGenerator.new({from: creator});
    });

    // it('generate me some randoms', async function () {
    //     for (let i = 0; i < 10; i++) {
    //         const {logs} = await this.generator.generate(randomAccount());
    //         console.log(logs);
    //     }
    // });

    context('updateSpecialModulo', function () {
        it('only owner ', async function () {
            await this.generator.updateSpecialModulo(4, {from: creator});
            const special = await this.generator.specialModulo();
            special.should.be.bignumber.equal(new BN(4));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateSpecialModulo(1, {from: other}));
        });
    });

    context('updateBuildingMapping', function () {
        it('only owner ', async function () {
            await this.generator.updateBuildingMapping(0, [1,2,3], {from: creator});
            const mappingBase = await this.generator.buildingMappings(0, 0);
            const mappingBody = await this.generator.buildingMappings(0, 1);
            const mappingRoof = await this.generator.buildingMappings(0, 2);
            mappingBase.should.be.bignumber.equal(new BN(1));
            mappingBody.should.be.bignumber.equal(new BN(2));
            mappingRoof.should.be.bignumber.equal(new BN(3));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateBuildingMapping(1, [1,2,3], {from: other}));
        });
    });

    function randomAccount() {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
