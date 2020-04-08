const _ = require('lodash');

const CityBuildingValidator = artifacts.require('CityBuildingValidator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('CityBuildingValidator tests', (accounts) => {

    const other = accounts[3];
    const platform = accounts[2];
    const creator = accounts[1];

    const ZERO = new BN('0');
    const ONE = new BN('1');
    const TWO = new BN('2');
    const THREE = new BN('3');

    before(async function () {
        this.validator = await CityBuildingValidator.new(platform, ZERO, {from: creator});

        await this.validator.updateBuildingMappings(ZERO, [ZERO, ONE], {from: creator});

        await this.validator.updateBuildingBaseMappings(ZERO, ZERO, [ZERO, ONE], {from: creator});
        await this.validator.updateBuildingBaseMappings(ZERO, ONE, [ONE], {from: creator});

        await this.validator.updateBuildingBodyMappings(ZERO, ZERO, [ZERO, ONE], {from: creator});
        await this.validator.updateBuildingBodyMappings(ZERO, ONE, [ONE], {from: creator});

        await this.validator.updateBuildingRoofMappings(ZERO, ZERO, [ZERO, ONE], {from: creator});
        await this.validator.updateBuildingRoofMappings(ZERO, ONE, [ONE], {from: creator});
    });

    context('validate buildings', function () {
        it('only valid buildings for rotation should return true', async function () {
            let res = await this.validator.validate(ZERO, ZERO, ZERO, ZERO, {from: creator});
            res.should.be.equal(true);

            res = await this.validator.validate(ZERO, ONE, ONE, ONE, {from: creator});
            res.should.be.equal(true);

            res = await this.validator.validate(ZERO, TWO, ONE, ONE, {from: creator});
            res.should.be.equal(false);

            res = await this.validator.validate(ZERO, ONE, TWO, ONE, {from: creator});
            res.should.be.equal(false);

            res = await this.validator.validate(ZERO, ONE, ONE, TWO, {from: creator});
            res.should.be.equal(false);
        });
    });

    context('updateBuildingMappings', function () {
        it('only owner or platform', async function () {
            await this.validator.updateBuildingMappings(ZERO, [THREE], {from: creator});
            let resArray = await this.validator.buildingMappingsArray();
            resArray.length.should.be.equal(1);
            resArray[0].should.be.bignumber.equal(THREE);
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.validator.updateBuildingMappings(ZERO, [THREE], {from: other}));
        });
    });


    context('updateBuildingBaseMappings', function () {
        it('only owner or platform', async function () {
            await this.validator.updateBuildingBaseMappings(ZERO, THREE, [THREE], {from: creator});
            let resArray = await this.validator.buildingBaseMappingsArray(THREE);
            resArray.length.should.be.equal(1);
            resArray[0].should.be.bignumber.equal(THREE);

        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.validator.updateBuildingBaseMappings(ZERO, THREE, [THREE], {from: other}));
        });
    });

    context('updateBuildingBodyMappings', function () {
        it('only owner or platform', async function () {
            await this.validator.updateBuildingBodyMappings(ZERO, THREE, [THREE], {from: creator});
            let resArray = await this.validator.buildingBodyMappingsArray(THREE);
            resArray.length.should.be.equal(1);
            resArray[0].should.be.bignumber.equal(THREE);

        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.validator.updateBuildingBodyMappings(ZERO, THREE, [THREE], {from: other}));
        });
    });

    context('updateBuildingRoofMappings', function () {
        it('only owner or platform', async function () {
            await this.validator.updateBuildingRoofMappings(ZERO, THREE, [THREE], {from: creator});
            let resArray = await this.validator.buildingRoofMappingsArray(THREE);
            resArray.length.should.be.equal(1);
            resArray[0].should.be.bignumber.equal(THREE);

        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.validator.updateBuildingRoofMappings(ZERO, THREE, [THREE], {from: other}));
        });
    });

});
