const _ = require('lodash');

const LogicGenerator = artifacts.require('LogicGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('LogicGenerator tests', (accounts) => {

    const other = accounts[2];
    const creator = accounts[1];

    before(async function () {
        this.generator = await LogicGenerator.new({from: creator});

        await this.generator.updateCityPercentages([0, 1], {from: creator});

        await this.generator.updateCityMappings(0, [0, 1], {from: creator});
        await this.generator.updateCityMappings(1, [2, 3], {from: creator});

        await this.generator.updateBuildingBaseMappings(0, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingBaseMappings(1, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingBaseMappings(2, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingBaseMappings(3, [0, 1, 2], {from: creator});

        await this.generator.updateBuildingBodyMappings(0, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingBodyMappings(1, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingBodyMappings(2, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingBodyMappings(3, [0, 1, 2], {from: creator});

        await this.generator.updateBuildingRoofMappings(0, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingRoofMappings(1, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingRoofMappings(2, [0, 1, 2], {from: creator});
        await this.generator.updateBuildingRoofMappings(3, [0, 1, 2], {from: creator});
    });

    it('generate me some randoms', async function () {
        for (let i = 0; i < 50; i++) {
            const account = randomAccount();
            console.log(`Generating building [${i}] for account [${account}]`);
            const {logs} = await this.generator.generate(account);
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
            await shouldFail.reverting(this.generator.updateBuildingBaseMappings(1, [1, 2, 3], {from: other}));
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
            await shouldFail.reverting(this.generator.updateBuildingBodyMappings(1, [1, 2, 3], {from: other}));
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
            await shouldFail.reverting(this.generator.updateBuildingRoofMappings(1, [1, 2, 3], {from: other}));
        });
    });

    function randomAccount () {
        // Random account between 0-5
        return accounts[Math.floor(Math.random() * Math.floor(5))];
    }
});
