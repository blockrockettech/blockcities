const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {ZERO_ADDRESS} = constants;

const {shouldBehaveLikeERC721} = require('./ERC721.behavior');
const BlockCities = artifacts.require('BlockCities');
const Generator = artifacts.require('Generator');

contract('ERC721', function ([_, creator, tokenOwner, anyone, ...accounts]) {
    beforeEach(async function () {
        this.generator = await Generator.new({from: creator});
        this.token = await BlockCities.new(this.generator.address, {from: creator});
        this.basePrice = await this.token.pricePerBuildingInWei();
    });

    shouldBehaveLikeERC721(creator, creator, accounts);

    describe('internal functions', function () {
        const tokenId = new BN('0');

        describe('_mint(address, uint256)', function () {
            // it('reverts with a null destination address', async function () {
            //     await shouldFail.reverting(this.token.mint(ZERO_ADDRESS, tokenId, {from: creator}));
            // });

            context('with minted token', async function () {
                beforeEach(async function () {
                    ({logs: this.logs} = await this.token.mintBuilding({from: tokenOwner, value: this.basePrice}));
                });

                it('emits a Transfer event', function () {
                    expectEvent.inLogs(this.logs, 'Transfer', {from: ZERO_ADDRESS, to: tokenOwner, tokenId});
                });

                it('creates the token', async function () {
                    (await this.token.balanceOf(tokenOwner)).should.be.bignumber.equal('1');
                    (await this.token.ownerOf(tokenId)).should.equal(tokenOwner);
                });

                // it('reverts when adding a token id that already exists', async function () {
                //     await shouldFail.reverting(this.token.mint(tokenOwner, tokenId));
                // });
            });
        });
    });
});
