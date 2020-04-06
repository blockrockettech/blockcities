const lodash = require('lodash');

const BlockCities = artifacts.require('BlockCities');

const LimitedVendingMachine = artifacts.require('LimitedVendingMachine');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('LimitedVendingMachineTest', ([_, creator, tokenOwner, anyone, whitelisted, blockcitiesAccount, ...accounts]) => {

    const ZERO = new BN(0);
    const ONE = new BN(1);
    const TWO = new BN(2);
    const firstTokenId = new BN(1);

    const firstURI = 'abc123';
    const baseURI = 'https://api.blockcities.co/';

    const buildingMintLimit = new BN(5);

    beforeEach(async function () {

        // Create 721 contract
        this.blockCities = await BlockCities.new(baseURI, {from: creator});

        // Create vending machine
        this.vendingMachine = await LimitedVendingMachine.new(
            this.blockCities.address,
            blockcitiesAccount,
            creator,
            buildingMintLimit,
            ZERO,
            {
                from: creator
            }
        );

        // Add to whitelist
        await this.blockCities.addWhitelisted(this.vendingMachine.address, {from: creator});
        (await this.blockCities.isWhitelisted(this.vendingMachine.address)).should.be.true;

        await this.blockCities.addWhitelisted(whitelisted, {from: creator});
        (await this.blockCities.isWhitelisted(whitelisted)).should.be.true;

        // ensure last sale block is set
        this.floor = await this.vendingMachine.floorPricePerBuildingInWei();
        this.priceStep = await this.vendingMachine.priceStepInWei();

        this.currentPrice = await this.vendingMachine.totalPrice();

        (await this.vendingMachine.buildingMintLimit()).should.be.bignumber.equal(buildingMintLimit);
        (await this.vendingMachine.totalBuildings()).should.be.bignumber.equal(new BN(0));

        const {logs} = await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, {
            from: tokenOwner,
            value: this.currentPrice
        });
        expectEvent.inLogs(
            logs,
            `VendingMachineTriggered`,
            {_tokenId: new BN(1), _architect: tokenOwner}
        );
    });

    context('ensure counters are functional', function () {
        it('returns total buildings', async function () {
            (await this.blockCities.totalBuildings()).should.be.bignumber.equal('1');
        });

        it('returns total purchases', async function () {
            (await this.vendingMachine.totalPurchasesInWei()).should.be.bignumber.equal(this.currentPrice);
        });

        it('building has an owner', async function () {
            // tokenOwner owns token ID zero
            (await this.blockCities.tokensOfOwner(tokenOwner))[0].should.be.bignumber.equal(firstTokenId);
        });

        it('building has attributes', async function () {
            const {
                _exteriorColorway,
                _backgroundColorway,
                _city,
                _building,
                _base,
                _body,
                _roof,
                _special,
                _architect,
            } = await this.blockCities.attributes(1);

            _exteriorColorway.should.be.bignumber.gte(ZERO);
            _backgroundColorway.should.be.bignumber.gte(ZERO);
            _city.should.be.bignumber.gte(ZERO);
            _building.should.be.bignumber.gte(ZERO);
            _base.should.be.bignumber.gte(ZERO);
            _body.should.be.bignumber.gte(ZERO);
            _roof.should.be.bignumber.gte(ZERO);
            _special.should.be.bignumber.gte(ZERO);
            _architect.should.be.equal(tokenOwner);
        });

        // FIXME - should be in BlockCities test file - create one
        it('returns Token URI', async function () {
            (await this.blockCities.tokenURI(new BN(1))).should.be.equal(baseURI + `1`);
        });

        it('returns name and symbol', async function () {
            (await this.blockCities.name()).should.be.equal(`BlockCities`);
            (await this.blockCities.symbol()).should.be.equal(`BKC`);
        });
    });

    context('price increases in steps', function () {

        it('price adjusts on invocation', async function () {
            const priceStep = await this.vendingMachine.priceStepInWei();

            const blockSale = await this.vendingMachine.lastSaleBlock();
            const priceBefore = await this.vendingMachine.totalPrice();

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: tokenOwner,
                value: priceBefore
            });

            const priceAfter = await this.vendingMachine.totalPrice();
            priceAfter.should.be.bignumber.equal(priceBefore.add(priceStep));

            // should move step up once
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, TWO, {
                from: tokenOwner,
                value: priceAfter.add(priceAfter)
            });

            const priceAfterBatch = await this.vendingMachine.totalPrice();
            priceAfterBatch.should.be.bignumber.equal(priceAfter.add(priceStep));
        });

        it('price adjusts on invocation but not above ceiling', async function () {
            const ceiling = await this.vendingMachine.ceilingPricePerBuildingInWei();
            await this.vendingMachine.setLastSalePrice(ceiling, {from: creator});

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: tokenOwner,
                value: ceiling
            });

            const priceAfter0 = await this.vendingMachine.totalPrice();
            priceAfter0.should.be.bignumber.equal(ceiling);

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, TWO, {
                from: tokenOwner,
                value: ceiling
            });

            const priceAfter1 = await this.vendingMachine.totalPrice();
            priceAfter1.should.be.bignumber.equal(ceiling);
        });
    });

    context('price decreases over time in blocks', function () {

        it('price adjusts on invocation', async function () {

            const blockStep = await this.vendingMachine.blockStep();
            const priceBefore = await this.vendingMachine.totalPrice();

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: tokenOwner,
                value: priceBefore
            });

            const priceAfter = await this.vendingMachine.totalPrice();

            priceAfter.should.be.bignumber.equal(priceBefore.add(this.priceStep));

            // advance blockstep
            for (let i = 0; i < blockStep.toNumber(); i++) {
                await this.vendingMachine.addCredit(tokenOwner, {from: creator});
            }

            const priceAfterBlockStep = await this.vendingMachine.totalPrice();
            priceAfterBlockStep.should.be.bignumber.equal(priceBefore);
        });

        it('price does not drop below floor', async function () {

            const blockStep = await this.vendingMachine.blockStep();
            const floor = await this.vendingMachine.floorPricePerBuildingInWei();
            await this.vendingMachine.setLastSalePrice(floor, {from: creator});

            // advance blockstep
            for (let i = 0; i < blockStep.mul(new BN(2)); i++) {
                await this.vendingMachine.addCredit(tokenOwner, {from: creator});
            }

            const priceAfterBlockStep = await this.vendingMachine.totalPrice();
            priceAfterBlockStep.should.be.bignumber.equal(floor);
        });
    });

    context('minting limit', function () {
        it('mints below the limit', async function () {
            (await this.vendingMachine.buildingsMintAllowanceRemaining()).should.be.bignumber.equal(new BN(4));

            let price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {from: tokenOwner, value: price});
            price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ONE, ZERO, {from: tokenOwner, value: price});
            price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ONE, ZERO, ZERO, {from: tokenOwner, value: price});
            price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ONE, ZERO, ZERO, ZERO, {from: tokenOwner, value: price});

            (await this.vendingMachine.buildingsMintAllowanceRemaining()).should.be.bignumber.equal(ZERO);
        });


        it('mints reverts above the limit', async function () {
            let price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {from: tokenOwner, value: price});
            price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ONE, ZERO, {from: tokenOwner, value: price});
            price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ONE, ZERO, ZERO, {from: tokenOwner, value: price});
            price = await this.vendingMachine.totalPrice();
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ONE, ZERO, ZERO, ZERO, {from: tokenOwner, value: price});
            shouldFail.reverting(this.vendingMachine.mintBuilding(ZERO, ONE, ZERO, ZERO, ZERO, ZERO, {
                from: tokenOwner,
                value: price
            }));
        });
    });

    context('total price and adjusting bands', function () {

        const startingPrice = new BN('75000000000000000');

        it('returns total price for one', async function () {
            const price = await this.vendingMachine.totalPrice();
            price.should.be.bignumber.equal(startingPrice.add(this.priceStep));
        });
    });

    context('ensure you can\'t mint the same building twice', function () {
        it('mints below the limit', async function () {
            let price = await this.vendingMachine.totalPrice();
            await shouldFail.reverting(this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, {
                from: tokenOwner,
                value: price
            }));
        });
    });

    context('ensure only owner can adjust last sale price', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setLastSalePrice(1, {from: tokenOwner}));
        });

        it('should set if owner', async function () {
            const priceNow = await this.vendingMachine.totalPrice();
            const {logs} = await this.vendingMachine.setLastSalePrice(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `LastSalePriceChanged`,
                {_oldLastSalePrice: priceNow, _newLastSalePrice: new BN(123)}
            );
        });
    });

    context('ensure only owner can change floor price per building', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setFloorPricePerBuildingInWei(1, {from: tokenOwner}));
        });

        it('should set if owner', async function () {
            const floorPricePerBuildingInWei = await this.vendingMachine.floorPricePerBuildingInWei();
            const {logs} = await this.vendingMachine.setFloorPricePerBuildingInWei(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `FloorPricePerBuildingInWeiChanged`,
                {
                    _oldFloorPricePerBuildingInWei: floorPricePerBuildingInWei,
                    _newFloorPricePerBuildingInWei: new BN(123)
                }
            );
        });
    });

    context('ensure only owner can change ceiling price per building', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setCeilingPricePerBuildingInWei(100, {from: tokenOwner}));
        });

        it('should set if owner', async function () {
            const ceilingPricePerBuildingInWei = await this.vendingMachine.ceilingPricePerBuildingInWei();
            const {logs} = await this.vendingMachine.setCeilingPricePerBuildingInWei(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `CeilingPricePerBuildingInWeiChanged`,
                {
                    _oldCeilingPricePerBuildingInWei: ceilingPricePerBuildingInWei,
                    _newCeilingPricePerBuildingInWei: new BN(123)
                }
            );
        });
    });

    context('ensure only owner can change price step in wei', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setPriceStepInWei(100, {from: tokenOwner}));
        });

        it('should set if owner', async function () {
            const priceStepInWei = await this.vendingMachine.priceStepInWei();
            const {logs} = await this.vendingMachine.setPriceStepInWei(123, {from: creator});
            expectEvent.inLogs(
                logs,
                `PriceStepInWeiChanged`,
                {
                    _oldPriceStepInWei: priceStepInWei,
                    _newPriceStepInWei: new BN(123)
                }
            );
        });
    });

    context('ensure only owner can change block step', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setBlockStep(100, {from: tokenOwner}));
        });

        it('should set if owner', async function () {
            const blockStep = await this.vendingMachine.blockStep();
            const {logs} = await this.vendingMachine.setBlockStep(240, {from: creator});
            expectEvent.inLogs(
                logs,
                `BlockStepChanged`,
                {
                    _oldBlockStep: blockStep,
                    _newBlockStep: new BN(240)
                }
            );
        });
    });

    context('ensure only owner can change last sale block', function () {
        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.vendingMachine.setLastSaleBlock(100, {from: tokenOwner}));
        });

        it('should set if owner', async function () {
            const lastSaleBlock = await this.vendingMachine.lastSaleBlock();
            const {logs} = await this.vendingMachine.setLastSaleBlock(1000, {from: creator});
            expectEvent.inLogs(
                logs,
                `LastSaleBlockChanged`,
                {
                    _oldLastSaleBlock: lastSaleBlock,
                    _newLastSaleBlock: new BN(1000)
                }
            );
        });
    });

    context('ensure only owner can burn', function () {
        beforeEach(async function () {
            const currentPrice = await this.vendingMachine.totalPrice();
            const {logs} = await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: tokenOwner,
                value: currentPrice
            });

            expectEvent.inLogs(
                logs,
                `VendingMachineTriggered`,
                {_tokenId: new BN(2), _architect: tokenOwner}
            );
        });

        it('should revert if not owner', async function () {
            await shouldFail.reverting(this.blockCities.burn(firstTokenId, {from: tokenOwner}));
        });

        it('should burn if owner', async function () {
            const {logs} = await this.blockCities.burn(firstTokenId, {from: creator});
            expectEvent.inLogs(
                logs,
                `Transfer`,
            );
            await shouldFail.reverting(this.blockCities.attributes(firstTokenId));
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
            await shouldFail.reverting(this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: tokenOwner,
                value: 0
            }));
        });
    });

    context('credits', function () {
        it('should fail if no credit and no value', async function () {
            await shouldFail.reverting(this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
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

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {from: tokenOwner, value: 0});
        });
    });

    context('splitFunds', function () {

        it('all parties get the correct amounts', async function () {
            const purchaser = whitelisted;
            const overpay = new BN(1000000);

            const currentPrice = await this.vendingMachine.totalPrice();
            const overpayPrice = currentPrice.add(overpay);

            const blockcities = new BN((await web3.eth.getBalance(blockcitiesAccount)));
            const partner = new BN((await web3.eth.getBalance(creator)));
            const purchaserBalanceBefore = new BN((await web3.eth.getBalance(purchaser)));

            const receipt = await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE,{
                from: purchaser,
                value: overpayPrice
            });
            const gasCosts = await getGasCosts(receipt);

            const blockcitiesAfter = new BN((await web3.eth.getBalance(blockcitiesAccount)));
            const partnerAfter = new BN((await web3.eth.getBalance(creator)));

            const purchaserBalanceAfter = new BN((await web3.eth.getBalance(purchaser)));

            // 85% of current
            blockcitiesAfter.should.be.bignumber.equal(blockcities.add(currentPrice.div(new BN(100)).mul(new BN(85))));

            // 15% of current
            partnerAfter.should.be.bignumber.equal(partner.add(currentPrice.div(new BN(100)).mul(new BN(15))));

            // check refund is applied and only pay for current price, not the overpay
            purchaserBalanceAfter.should.be.bignumber.equal(
                purchaserBalanceBefore
                    .sub(gasCosts)
                    .sub(currentPrice)
            );
        });

        it('does not take msg.value when consuming credits', async function () {
            const purchaser = whitelisted;

            // Add a single credit so purchaser should get monies back
            await this.vendingMachine.addCredit(purchaser, {from: creator});
            (await this.vendingMachine.credits(purchaser)).should.be.bignumber.equal('1');

            // Check only 1 purchase made so far
            (await this.vendingMachine.totalPurchasesInWei()).should.be.bignumber.equal(this.currentPrice);

            const currentPrice = await this.vendingMachine.totalPrice();

            const purchaserBalanceBefore = new BN((await web3.eth.getBalance(purchaser)));

            // send msg.value even though we have credits
            const receipt = await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE,{
                from: purchaser,
                value: currentPrice
            });
            const gasCosts = await getGasCosts(receipt);

            const purchaserBalanceAfter = new BN((await web3.eth.getBalance(purchaser)));

            // check all amount os refunded and credits consumed
            purchaserBalanceAfter.should.be.bignumber.equal(
                purchaserBalanceBefore
                    .sub(gasCosts)
            );

            (await this.vendingMachine.credits(purchaser)).should.be.bignumber.equal('0');

            // Check total purchases doesnt change
            (await this.vendingMachine.totalPurchasesInWei()).should.be.bignumber.equal(this.currentPrice);
        });

    });

    context('price increases then decreases then sets step up from current price', function () {

        it('price adjusts on invocation', async function () {
            const priceStep = await this.vendingMachine.priceStepInWei();

            const priceBeforeTest = await this.vendingMachine.totalPrice();

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE,{from: tokenOwner, value: priceBeforeTest});

            const priceAfterOneStep = await this.vendingMachine.totalPrice();
            priceAfterOneStep.should.be.bignumber.equal(priceBeforeTest.add(priceStep));

            // should move step up once
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ONE, ZERO,{from: tokenOwner, value: priceAfterOneStep.add(priceAfterOneStep)});

            const priceAfterTwoStep = await this.vendingMachine.totalPrice();
            priceAfterTwoStep.should.be.bignumber.equal(priceAfterOneStep.add(priceStep));

            const blockStep = await this.vendingMachine.blockStep();

            // advance blockstep
            for (let i = 0; i < blockStep.toNumber(); i++) {
                await this.vendingMachine.addCredit(tokenOwner, {from: creator});
            }

            const priceAfterCooldownOne = await this.vendingMachine.totalPrice();
            priceAfterCooldownOne.should.be.bignumber.equal(priceAfterOneStep);

            // advance blockstep
            for (let i = 0; i < blockStep.toNumber(); i++) {
                await this.vendingMachine.addCredit(tokenOwner, {from: creator});
            }

            const priceAfterCooldownTwo = await this.vendingMachine.totalPrice();
            priceAfterCooldownTwo.should.be.bignumber.equal(priceBeforeTest);

            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ONE, ZERO, ZERO,{from: tokenOwner, value: priceBeforeTest});

            const priceAfterThreeStep = await this.vendingMachine.totalPrice();
            priceAfterThreeStep.should.be.bignumber.equal(priceBeforeTest.add(priceStep));
        });
    });

    context.only('pausing minting', function () {
        const purchaser = whitelisted;

        it('reverts mint when contract is paused', async function () {
            await this.vendingMachine.pause({from: creator});

            const price = await this.vendingMachine.totalPrice();
            await shouldFail.reverting(this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: purchaser,
                value: price
            }));

            await this.vendingMachine.unpause({from: creator});
            await this.vendingMachine.mintBuilding(ZERO, ZERO, ZERO, ZERO, ZERO, ONE, {
                from: purchaser,
                value: price
            })
        });
    });

    async function getGasCosts(receipt) {
        let tx = await web3.eth.getTransaction(receipt.tx);
        let gasPrice = new BN(tx.gasPrice);
        return gasPrice.mul(new BN(receipt.receipt.gasUsed));
    }

});
