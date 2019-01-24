const BlockCities = artifacts.require('BlockCities');
const Generator = artifacts.require('Generator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('BlockCities', ([_, creator, tokenOwner, anyone, ...accounts]) => {

    const firstTokenId = new BN(0);
    const secondTokenId = new BN(1);
    const unknownTokenId = new BN(999);

    context('ensure counters are functional', function () {
        before(async function () {
            this.generator = await Generator.new({from: creator});
            this.token = await BlockCities.new(this.generator.address, {from: creator});
            this.basePrice = await this.token.pricePerBuildingInWei();

            (await this.token.totalBuildings()).should.be.bignumber.equal('0');
            (await this.token.totalPurchasesInWei()).should.be.bignumber.equal('0');
            (await this.token.tokenPointer()).should.be.bignumber.equal('0');

            // mint a single building
            const {logs} = await this.token.mintBuilding({from: tokenOwner, value: this.basePrice});
            expectEvent.inLogs(logs, `BuildingMinted`, {_tokenId: new BN(0), _architect: tokenOwner});
        });

        it('returns total buildings', async function () {
            (await this.token.totalBuildings()).should.be.bignumber.equal('1');
        });

        it('returns total purchases', async function () {
            (await this.token.totalPurchasesInWei()).should.be.bignumber.equal(this.basePrice);
        });

        it('token pointer has advanced', async function () {
            (await this.token.tokenPointer()).should.be.bignumber.equal('1');
        });

        it('building has an owner', async function () {
            // tokenOwner owns token ID zero
            (await this.token.tokensOfOwner(tokenOwner))[0].should.be.bignumber.equal(firstTokenId);
        });

        it('building has attributes', async function () {
            // 4 = base, body, roof, and architect
            const attrs = await this.token.attributes(0);
            attrs[0].should.be.bignumber.lte('1');
            attrs[1].should.be.bignumber.lte('2');
            attrs[2].should.be.bignumber.lte('2');
            attrs[3].should.be.bignumber.lte('2');
        });
    });

    context('ensure only owner can add cities', function () {
        before(async function () {
            this.generator = await Generator.new({from: creator});
            this.token = await BlockCities.new(this.generator.address, {from: creator});
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.token.addCity(web3.utils.asciiToHex('Hull'), {from: tokenOwner}));
        });

        it('should add new city if owner', async function () {
            const {logs} = await this.token.addCity(web3.utils.asciiToHex('Hull'), {from: creator});
            // two already exist in contract, therefore, cityId is 2
            expectEvent.inLogs(
                logs,
                `CityAdded`,
                {_cityId: new BN(2), _cityName: web3.utils.padRight(web3.utils.asciiToHex('Hull'), 64)}
            );
        });
    });

    context('ensure only owner can change base price', function () {
        before(async function () {
            this.generator = await Generator.new({from: creator});
            this.token = await BlockCities.new(this.generator.address, {from: creator});
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.token.setPricePerBuildingInWei(1, {from: tokenOwner}));
        });

        it('should add new city if owner', async function () {
            const {logs} = await this.token.setPricePerBuildingInWei(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `PricePerBuildingInWeiChanged`,
                {_oldPricePerBuildingInWei: new BN(100), _newPricePerBuildingInWei: new BN(123)}
            );
        });
    });

    context('ensure only owner can transfer buildings', function () {
        before(async function () {
            this.generator = await Generator.new({from: creator});
            this.token = await BlockCities.new(this.generator.address, {from: creator});
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.token.transferBuilding(anyone, 0, 0, 0, 0, {from: tokenOwner}));
        });

        it('should transfer if owner', async function () {
            const {logs} = await this.token.transferBuilding(anyone, 0, 0, 0, 0, {from: creator});
            expectEvent.inLogs(
                logs,
                `BuildingTransfer`,
                {_tokenId: new BN(0), _to: anyone, _architect: creator}
            );

            const attrs = await this.token.attributes(0);
            attrs[0].should.be.bignumber.equal('0');
            attrs[1].should.be.bignumber.equal('0');
            attrs[2].should.be.bignumber.equal('0');
            attrs[3].should.be.bignumber.equal('0');
            attrs[4].should.be.equal(creator);
        });
    });

    context('ensure can not mint with less than minimum purchase value', function () {
        before(async function () {
            this.generator = await Generator.new({from: creator});
            this.token = await BlockCities.new(this.generator.address, {from: creator});
            this.basePrice = await this.token.pricePerBuildingInWei();
        });

        it('should revert if not enough payable', async function () {
            await shouldFail.reverting(this.token.mintBuilding({from: tokenOwner, value: 0}));
        });
    });

    context('random buildings to console', function () {
        before(async function () {
            this.generator = await Generator.new({from: creator});
            this.token = await BlockCities.new(this.generator.address, {from: creator});
            this.basePrice = await this.token.pricePerBuildingInWei();
        });

        it('should mint random', async function () {
            for (i = 0; i < 10; i++) {
                await this.token.mintBuilding({from: accounts[i + 5], value: 100});
                const attrs = await this.token.attributes(i);
                console.log(`
                City: ${attrs[0].toString()}, 
                Base: ${attrs[1].toString()}, 
                Body: ${attrs[2].toString()}, 
                Roof: ${attrs[3].toString()}, 
                Architect: ${attrs[4].toString()}
                `);
            }
        });
    });
});