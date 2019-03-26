const BlockCities = artifacts.require('BlockCities');

const LogicGenerator = artifacts.require('LogicGenerator');
const ColourGenerator = artifacts.require('ColourGenerator');

const BlockCitiesVendingMachine = artifacts.require('BlockCitiesVendingMachine');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract('BlockCitiesVendingMachineTest', ([_, creator, tokenOwner, anyone, ...accounts]) => {

    const firstTokenId = new BN(1);
    const secondTokenId = new BN(2);
    const unknownTokenId = new BN(999);

    const firstURI = 'abc123';
    const baseURI = 'https://api.blockcities.co';

    before(async function () {
        // Create 721 contract
        this.blockCities = await BlockCities.new(baseURI, {from: creator});

        // Add 2 test cities
        await this.blockCities.addCity(web3.utils.fromAscii('Atlanta'), {from: creator});
        await this.blockCities.addCity(web3.utils.fromAscii('Chicago'), {from: creator});
        (await this.blockCities.totalCities()).should.be.bignumber.equal('2');

        // Create generators
        this.logicGenerator = await LogicGenerator.new({from: creator});
        this.colourGenerator = await ColourGenerator.new({from: creator});

        // Create vending machine
        this.vendingMachine = await BlockCitiesVendingMachine.new(
            this.logicGenerator.address,
            this.colourGenerator.address,
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

        it('building has attributes', async function () {
            // 4 = base, body, roof, and architect
            const attrs = await this.blockCities.attributes(1);
            attrs[0].should.be.bignumber.lte('6'); // FIXME add all attrs
        });
    });

    context('batch mint buildings', function () {

        it('returns total buildings', async function () {
            const numberOfBuildings = new BN(3);
            const batchPrice = await this.vendingMachine.totalPrice(numberOfBuildings);
            let totalBuildingsPre = await this.blockCities.totalBuildings();

            await this.vendingMachine.mintBatch(numberOfBuildings, {from: tokenOwner, value: batchPrice});

            const totalBuildingsPost = await this.blockCities.totalBuildings();
            totalBuildingsPost.should.be.bignumber.equal(totalBuildingsPre.add(numberOfBuildings));
        });

    });

    context('total price and adjusting bands', function () {

        it('returns total price for one', async function () {
            const price = await this.vendingMachine.totalPrice(new BN(1));

            price.should.be.bignumber.equal(this.basePrice);
        });

        it('returns total price for three', async function () {
            const price = await this.vendingMachine.totalPrice(new BN(3));

            price.should.be.bignumber.equal(this.basePrice.mul(new BN(3)));
        });

        it('returns total price for five', async function () {
            const price = await this.vendingMachine.totalPrice(new BN(5));

            // 20% off
            price.should.be.bignumber.equal(new BN(400));
        });

        it('returns total price for ten', async function () {
            const price = await this.vendingMachine.totalPrice(new BN(10));

            // 30% off
            price.should.be.bignumber.equal(new BN(700));
        });

        it('adjusts percentage bands', async function () {
            await this.vendingMachine.setPriceDiscountBands([new BN(85), new BN(75)], {from: creator});

            // 15% off
            let price = await this.vendingMachine.totalPrice(new BN(5));
            price.should.be.bignumber.equal(new BN(425));

            // 25% off
            price = await this.vendingMachine.totalPrice(new BN(10));
            price.should.be.bignumber.equal(new BN(750));
        });

        it('adjusts percentage bands can only be done be owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setPriceDiscountBands([new BN(85), new BN(75)], {from: tokenOwner}));
        });
    });

    context('ensure only owner can add cities', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blockCities.addCity(web3.utils.asciiToHex('Hull'), {from: anyone}));
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
            await shouldFail.reverting(this.blockCities.createBuilding(1, 1, 2, 1, 1, 2, 1, 0, tokenOwner, {from: anyone}));
        });

        it('should transfer if owner', async function () {
            const {logs} = await this.blockCities.createBuilding(1, 1, 1, 1, 1, 1, 1, 0, anyone, {from: creator});
            expectEvent.inLogs(
                logs,
                `BuildingMinted`,
                {
                    _to: anyone,
                    _architect: anyone
                }
            );
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
            const {logs} = await this.vendingMachine.addCredit(tokenOwner, {from: creator});
            expectEvent.inLogs(
                logs,
                `CreditAdded`,
                {
                    _to: tokenOwner
                }
            );

            await this.vendingMachine.mintBuilding({from: tokenOwner, value: 0});
        });

        it('should add credit batch', async function () {
            await this.vendingMachine.addCreditBatch([tokenOwner, anyone], {from: creator});

            (await this.vendingMachine.credits(tokenOwner)).should.be.bignumber.equal('1');
            (await this.vendingMachine.credits(anyone)).should.be.bignumber.equal('1');
        });
    });

    context.skip('random buildings to console', function () {
        it('should mint random', async function () {
            this.basePrice = await this.vendingMachine.pricePerBuildingInWei();

            for (let i = 1; i < 13; i++) {
                const tokenId = await this.vendingMachine.mintBuilding({from: accounts[i], value: this.basePrice});
                console.log(tokenId.logs);
                const attrs = await this.blockCities.attributes(tokenId, {from: accounts[i]});
                console.log(`
                    ID: ${tokenId},
                    _exteriorColorway: ${attrs[0].toString()},
                    _windowColorway: ${attrs[1].toString()},
                    _city: ${attrs[2].toString()},
                    _base: ${attrs[3].toString()},
                    _body: ${attrs[4].toString()},
                    _roof: ${attrs[5].toString()},
                    _special: ${attrs[6].toString()},
                    _architect: ${attrs[7].toString()},
                `);
            }
        });
    });
});
