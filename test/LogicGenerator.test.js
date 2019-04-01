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
        for (let i = 0; i < 10; i++) {
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

    // context('updateBuildingMapping', function () {
    //     it('only owner ', async function () {
    //         await this.generator.updateBuildingMapping(0, [1,2,3], {from: creator});
    //         const mappingBase = await this.generator.buildingMappings(0, 0);
    //         const mappingBody = await this.generator.buildingMappings(0, 1);
    //         const mappingRoof = await this.generator.buildingMappings(0, 2);
    //         mappingBase.should.be.bignumber.equal(new BN(1));
    //         mappingBody.should.be.bignumber.equal(new BN(2));
    //         mappingRoof.should.be.bignumber.equal(new BN(3));
    //     });
    //
    //     it('should revert if not owner', async function () {
    //         await shouldFail.reverting(this.generator.updateBuildingMapping(1, [1,2,3], {from: other}));
    //     });
    // });

    function randomAccount () {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
