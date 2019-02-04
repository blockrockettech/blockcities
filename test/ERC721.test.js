const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');
const {ZERO_ADDRESS} = constants;

const {shouldBehaveLikeERC721} = require('./ERC721.behavior');
const BlockCities = artifacts.require('BlockCities');

contract('ERC721', function ([_, creator, tokenOwner, anyone, ...accounts]) {

    const firstTokenId = new BN(1);
    const secondTokenId = new BN(2);
    const unknownTokenId = new BN(999);

    const firstURI = 'abc123';
    const baseURI = 'https://api.blockcities.co';

    beforeEach(async function () {
        this.token = await BlockCities.new(baseURI, {from: creator});

        await this.token.addCity(web3.utils.fromAscii("Atlanta"), {from: creator});
        await this.token.addCity(web3.utils.fromAscii("Chicago"), {from: creator});

        (await this.token.totalCities()).should.be.bignumber.equal('2');

        (await this.token.isWhitelisted(creator)).should.be.true;

        (await this.token.totalBuildings()).should.be.bignumber.equal('0');
    });

    shouldBehaveLikeERC721(creator, creator, accounts);

    describe('internal functions', function () {
        const tokenId = new BN('1');

        describe('_mint(address, uint256)', function () {
            context('with minted token', async function () {
                beforeEach(async function () {
                    ({logs: this.logs} = await this.token.createBuilding(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, creator, {from: creator}));
                });

                it('emits a Transfer event', function () {
                    expectEvent.inLogs(this.logs, 'Transfer', {from: ZERO_ADDRESS, to: creator, tokenId});
                });

                it('creates the token', async function () {
                    (await this.token.balanceOf(creator)).should.be.bignumber.equal('1');
                    (await this.token.ownerOf(tokenId)).should.equal(creator);
                });
            });
        });
    });

    describe('_burn(uint256)', function () {

        it('reverts when burning a non-existent token id', async function () {
            await shouldFail.reverting(this.token.methods['burn(uint256)'](999, {from: creator}));
        });

        context('with minted token', function () {
            const tokenId = new BN('1');

            beforeEach(async function () {
                ({logs: this.logs} = await this.token.createBuilding(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, anyone, {from: creator}));
            });

            context('with burnt token', function () {
                beforeEach(async function () {
                    ({logs: this.logs} = await this.token.methods['burn(uint256)'](tokenId, {from: creator}));
                });

                it('emits a Transfer event', function () {
                    expectEvent.inLogs(this.logs, 'Transfer', {from: anyone, to: ZERO_ADDRESS, tokenId});
                });

                it('deletes the token', async function () {
                    (await this.token.balanceOf(creator)).should.be.bignumber.equal('0');
                    await shouldFail.reverting(this.token.ownerOf(tokenId));
                });

                it('reverts when burning a token id that has been deleted', async function () {
                    await shouldFail.reverting(this.token.methods['burn(uint256)'](tokenId));
                });
            });
        });
    });
});
