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

    // context('updateBuildingBaseMappings', function () {
    //     it('only owner or platform', async function () {
    //         await this.generator.updateBuildingBaseMappings(0, [1, 2], {from: creator});
    //         let base0 = await this.generator.buildingBaseMappings(0, 0);
    //         let base1 = await this.generator.buildingBaseMappings(0, 1);
    //         base0.should.be.bignumber.equal(new BN(1));
    //         base1.should.be.bignumber.equal(new BN(2));
    //
    //         await this.generator.updateBuildingBaseMappings(0, [1, 2], {from: platform});
    //         base0 = await this.generator.buildingBaseMappings(0, 0);
    //         base1 = await this.generator.buildingBaseMappings(0, 1);
    //         base0.should.be.bignumber.equal(new BN(1));
    //         base1.should.be.bignumber.equal(new BN(2));
    //     });
    //
    //     it('should revert if not owner', async function () {
    //         await shouldFail.reverting(this.generator.updateBuildingBaseMappings(1, [1, 2, 3], {from: other}));
    //     });
    // });
    //
    // context('updateBuildingBodyMappings', function () {
    //     it('only owner or platform', async function () {
    //         await this.generator.updateBuildingBodyMappings(0, [1, 2], {from: creator});
    //         let body0 = await this.generator.buildingBodyMappings(0, 0);
    //         let body1 = await this.generator.buildingBodyMappings(0, 1);
    //         body0.should.be.bignumber.equal(new BN(1));
    //         body1.should.be.bignumber.equal(new BN(2));
    //
    //         await this.generator.updateBuildingBodyMappings(0, [1, 2], {from: platform});
    //         body0 = await this.generator.buildingBodyMappings(0, 0);
    //         body1 = await this.generator.buildingBodyMappings(0, 1);
    //         body0.should.be.bignumber.equal(new BN(1));
    //         body1.should.be.bignumber.equal(new BN(2));
    //     });
    //
    //     it('should revert if not owner', async function () {
    //         await shouldFail.reverting(this.generator.updateBuildingBodyMappings(1, [1, 2, 3], {from: other}));
    //     });
    // });
    //
    // context('updateBuildingBodyMappings', function () {
    //     it('only owner ', async function () {
    //         await this.generator.updateBuildingRoofMappings(0, [1, 2], {from: creator});
    //         let roof0 = await this.generator.buildingRoofMappings(0, 0);
    //         let roof1 = await this.generator.buildingRoofMappings(0, 1);
    //         roof0.should.be.bignumber.equal(new BN(1));
    //         roof1.should.be.bignumber.equal(new BN(2));
    //
    //         await this.generator.updateBuildingRoofMappings(0, [1, 2], {from: platform});
    //         roof0 = await this.generator.buildingRoofMappings(0, 0);
    //         roof1 = await this.generator.buildingRoofMappings(0, 1);
    //         roof0.should.be.bignumber.equal(new BN(1));
    //         roof1.should.be.bignumber.equal(new BN(2));
    //     });
    //
    //     it('should revert if not owner', async function () {
    //         await shouldFail.reverting(this.generator.updateBuildingRoofMappings(1, [1, 2, 3], {from: other}));
    //     });
    // });


});
