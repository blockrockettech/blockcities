const _ = require('lodash');

const LogicGenerator = artifacts.require('LogicGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('LogicGenerator tests', ([_, creator, other, ...accounts]) => {

    before(async function () {
        this.generator = await LogicGenerator.new({from: creator});

        this.generator.updateBuildingBaseMappings(0, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(1, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(2, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(3, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(4, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(5, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(6, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(7, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(8, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(9, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(10, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(11, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(12, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(13, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBaseMappings(14, [0, 1, 2], {from: creator});

        this.generator.updateBuildingBodyMappings(0, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(1, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(2, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(3, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(4, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(5, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(6, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(7, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(8, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(9, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(10, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(11, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(12, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(13, [0, 1, 2], {from: creator});
        this.generator.updateBuildingBodyMappings(14, [0, 1, 2], {from: creator});

        this.generator.updateBuildingRoofMappings(0, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(1, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(2, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(3, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(4, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(5, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(6, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(7, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(8, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(9, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(10, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(11, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(12, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(13, [0, 1, 2], {from: creator});
        this.generator.updateBuildingRoofMappings(14, [0, 1, 2], {from: creator});
    });

    it('generate me some randoms', async function () {
        for (let i = 0; i < 50; i++) {
            const {logs} = await this.generator.generate(randomAccount());
            console.log(logs);
        }
    });

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

    context('updateSpecialNo', function () {
        it('only owner ', async function () {
            await this.generator.updateSpecialNo(23, {from: creator});
            const special = await this.generator.specialNo();
            special.should.be.bignumber.equal(new BN(23));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateSpecialNo(1, {from: other}));
        });
    });

    context('updateBuildingBaseMappings', function () {
        it('only owner ', async function () {
            await this.generator.updateBuildingBaseMappings(0, [1, 2], {from: creator});
            const base0 = await this.generator.buildingBaseMappings(0, 0);
            const base1 = await this.generator.buildingBaseMappings(0, 1);
            base0.should.be.bignumber.equal(new BN(1));
            base1.should.be.bignumber.equal(new BN(2));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateBuildingBaseMappings(1, [1,2,3], {from: other}));
        });
    });

    context('updateBuildingBodyMappings', function () {
        it('only owner ', async function () {
            await this.generator.updateBuildingBodyMappings(0, [1, 2], {from: creator});
            const body0 = await this.generator.buildingBodyMappings(0, 0);
            const body1 = await this.generator.buildingBodyMappings(0, 1);
            body0.should.be.bignumber.equal(new BN(1));
            body1.should.be.bignumber.equal(new BN(2));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateBuildingBodyMappings(1, [1,2,3], {from: other}));
        });
    });

    context('updateBuildingBodyMappings', function () {
        it('only owner ', async function () {
            await this.generator.updateBuildingRoofMappings(0, [1, 2], {from: creator});
            const roof0 = await this.generator.buildingRoofMappings(0, 0);
            const roof1 = await this.generator.buildingRoofMappings(0, 1);
            roof0.should.be.bignumber.equal(new BN(1));
            roof1.should.be.bignumber.equal(new BN(2));
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.generator.updateBuildingRoofMappings(1, [1,2,3], {from: other}));
        });
    });

    function randomAccount () {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
