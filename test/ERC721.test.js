const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {ZERO_ADDRESS} = constants;

const {shouldBehaveLikeERC721} = require('./ERC721.behavior');
const BlockCities = artifacts.require('BlockCities');
const Generator = artifacts.require('Generator');

contract('ERC721', function ([_, creator, tokenOwner, anyone, ...accounts]) {
    beforeEach(async function () {
        this.token = await BlockCities.new({from: creator});
        this.token.addCity(web3.utils.fromAscii("Atlanta"));
        this.token.addCity(web3.utils.fromAscii("Chicago"));
    });

    shouldBehaveLikeERC721(creator, creator, accounts);

    describe('internal functions', function () {
        const tokenId = new BN('1000000');

        describe('_mint(address, uint256)', function () {
            context('with minted token', async function () {
                beforeEach(async function () {
                    ({logs: this.logs} = await this.token.mintBuilding(tokenId, 'abc', {
                        from: tokenOwner,
                        value: this.basePrice
                    }));
                });

                it('emits a Transfer event', function () {
                    expectEvent.inLogs(this.logs, 'Transfer', {from: ZERO_ADDRESS, to: tokenOwner, tokenId});
                });

                it('creates the token', async function () {
                    (await this.token.balanceOf(tokenOwner)).should.be.bignumber.equal('1');
                    (await this.token.ownerOf(tokenId)).should.equal(tokenOwner);
                });

                it('reverts when adding a token id that already exists', async function () {
                    await shouldFail.reverting(this.token.mintBuilding(tokenId, 'abc', {
                        from: tokenOwner,
                        value: this.basePrice
                    }));
                });
            });
        });
    });

    describe('_burn(uint256)', function () {

        it('reverts when burning a non-existent token id', async function () {
            await shouldFail.reverting(this.token.methods['burn(uint256)'](999, {from: creator}));
        });

        context('with minted token', function () {
            const tokenId = new BN('1000000');

            beforeEach(async function () {
                ({logs: this.logs} = await this.token.mintBuilding(
                    tokenId,
                    'abc',
                    {
                        from: tokenOwner,
                        value: this.basePrice
                    }
                ));
            });

            context('with burnt token', function () {
                beforeEach(async function () {
                    ({logs: this.logs} = await this.token.methods['burn(uint256)'](tokenId, {from: creator}));
                });

                it('emits a Transfer event', function () {
                    expectEvent.inLogs(this.logs, 'Transfer', {from: tokenOwner, to: ZERO_ADDRESS, tokenId});
                });

                it('deletes the token', async function () {
                    (await this.token.balanceOf(tokenOwner)).should.be.bignumber.equal('0');
                    await shouldFail.reverting(this.token.ownerOf(tokenId));
                });

                it('reverts when burning a token id that has been deleted', async function () {
                    await shouldFail.reverting(this.token.methods['burn(uint256)'](tokenId));
                });
            });
        });
    });
});
