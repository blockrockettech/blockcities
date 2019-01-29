const BlockCities = artifacts.require('BlockCities');
const Generator = artifacts.require('Generator');
const CityGenerator = artifacts.require('CityGenerator');
const BlockCitiesVendingMachine = artifacts.require('BlockCitiesVendingMachine');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('BlockCitiesVendingMachineTest', ([_, creator, tokenOwner, anyone, ...accounts]) => {

    const firstTokenId = new BN(1);
    const secondTokenId = new BN(2);
    const unknownTokenId = new BN(999);

    const firstURI = 'abc123';

    before(async function () {
        // Create 721 contract
        this.blockCities = await BlockCities.new({from: creator});

        // Add 2 test cities
        await this.blockCities.addCity(web3.utils.fromAscii("Atlanta"), {from: creator});
        await this.blockCities.addCity(web3.utils.fromAscii("Chicago"), {from: creator});
        (await this.blockCities.totalCities()).should.be.bignumber.equal('2');

        // Create generator
        this.generator = await Generator.new({from: creator});
        this.cityGenerator = await CityGenerator.new({from: creator});

        // Create vending machine
        this.vendingMachine = await BlockCitiesVendingMachine.new(
            this.generator.address,
            this.cityGenerator.address,
            this.blockCities.address,
            {
                from: creator
            }
        );

        // Add to whitelist
        await this.blockCities.addWhitelisted(this.vendingMachine.address, {from: creator});
        (await this.blockCities.isWhitelisted(this.vendingMachine.address)).should.be.true;

        this.basePrice = await this.vendingMachine.pricePerBuildingInWei();
        this.basePrice.should.be.bignumber.equal('100');

        (await this.blockCities.totalBuildings()).should.be.bignumber.equal('0');
        (await this.vendingMachine.totalPurchasesInWei()).should.be.bignumber.equal('0');
    });

    context('ensure counters are functional', function () {
        before(async function () {

            // mint a single building
            const {logs} = await this.vendingMachine.mintBuilding({from: tokenOwner, value: this.basePrice});

            expectEvent.inLogs(
                logs,
                `VendingMachineTriggered`,
                {_tokenId: new BN(1), _architect: tokenOwner}
            );
        });

        it('returns total buildings', async function () {
            (await this.blockCities.totalBuildings()).should.be.bignumber.equal('1');
        });

        it('returns total purchases', async function () {
            (await this.vendingMachine.totalPurchasesInWei()).should.be.bignumber.equal(this.basePrice);
        });

        it('building has an owner', async function () {
            // tokenOwner owns token ID zero
            (await this.blockCities.tokensOfOwner(tokenOwner))[0].should.be.bignumber.equal(firstTokenId);
        });

        // TODO add all attributes to this
        it('building has attributes', async function () {
            // 4 = base, body, roof, and architect
            const attrs = await this.blockCities.attributes(0);
            attrs[0].should.be.bignumber.lte('1');
            attrs[1].should.be.bignumber.lte('2');
            attrs[2].should.be.bignumber.lte('2');
            attrs[3].should.be.bignumber.lte('2');
        });
    });

    context('ensure only owner can add cities', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blockCities.addCity(web3.utils.asciiToHex('Hull'), {from: tokenOwner}));
        });

        it('should add new city if owner', async function () {
            const {logs} = await this.blockCities.addCity(web3.utils.asciiToHex('Hull'), {from: creator});
            // two already exist in contract, therefore, cityId is 2
            expectEvent.inLogs(
                logs,
                `CityAdded`,
                {_cityId: new BN(2), _cityName: web3.utils.padRight(web3.utils.asciiToHex('Hull'), 64)}
            );
        });
    });

    context('ensure only owner can change base price', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setPricePerBuildingInWei(1, {from: tokenOwner}));
        });

        it('should add new city if owner', async function () {
            const {logs} = await this.vendingMachine.setPricePerBuildingInWei(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `PricePerBuildingInWeiChanged`,
                {_oldPricePerBuildingInWei: new BN(100), _newPricePerBuildingInWei: new BN(123)}
            );
        });
    });

    context('ensure only owner can burn', function () {

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blockCities.burn(firstTokenId, {from: tokenOwner}));
        });

        it('should burn if owner', async function () {
            const {logs} = await this.blockCities.burn(firstTokenId, {from: creator});
            expectEvent.inLogs(
                logs,
                `Transfer`,
            );
        });
    });

    context('ensure only owner can transfer buildings', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blockCities.createBuilding(1, 1, 2, 1, 2, 1, 1, 1, 2, 1, tokenOwner, {from: tokenOwner}));
        });

        it('should transfer if owner', async function () {
            const {logs} = await this.blockCities.createBuilding(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, anyone, {from: creator});
            expectEvent.inLogs(
                logs,
                `BuildingMinted`,
                {
                    _tokenId: new BN(2),
                    _to: anyone,
                    _architect: anyone,
                    _tokenURI: 'https://api.blockcitties.co/token/2'
                }
            );

            // TODO fix attributes
            const attrs = await this.blockCities.attributes(new BN(2));
            attrs[0].should.be.bignumber.equal('1');
            attrs[1].should.be.bignumber.equal('1');
            attrs[2].should.be.bignumber.equal('1');
            attrs[3].should.be.bignumber.equal('1');
            attrs[4].should.be.equal(anyone);
        });
    });

    context('ensure can not mint with less than minimum purchase value', function () {
        it('should revert if not enough payable', async function () {
            await shouldFail.reverting(this.vendingMachine.mintBuilding({
                from: tokenOwner,
                value: 0
            }));
        });
    });

    context('credits', function () {
        it('should fail if no credit and no value', async function () {
            await shouldFail.reverting(this.vendingMachine.mintBuilding({
                from: tokenOwner,
                value: 0
            }));
        });

        it('should fulfil if credit and no value', async function () {
            await this.vendingMachine.addCredit(tokenOwner, {from: creator});
            await this.vendingMachine.mintBuilding({from: tokenOwner, value: 0});
        });
    });

    context('random buildings to console', function () {
        it('should mint random', async function () {
            this.basePrice = await this.vendingMachine.pricePerBuildingInWei();

            for (let i = 0; i < 5; i++) {
                await this.vendingMachine.mintBuilding({from: accounts[i], value: this.basePrice});
                const attrs = await this.blockCities.attributes(i);
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
