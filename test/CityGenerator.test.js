const CityGenerator = artifacts.require('CityGenerator');

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers');

contract.only('CityGenerator tests', (accounts) => {


    before(async function () {
        console.log(accounts);
        this.cityGenerator = await CityGenerator.new({from: accounts[0]});
    });

    it('generate me some randoms', async function () {
        const results = {};
        for (let i = 0; i < 1000; i++) {

            const randomCity = await this.cityGenerator.generate.call(randomAccount());
            // console.log(randomCity);

            if (results[randomCity]) {
                results[randomCity]++;
            } else {
                results[randomCity] = 1;
            }
        }

        console.log(results);
    });

    function randomAccount() {
        // Random account between 0-9 (10 accounts)
        return accounts[Math.floor(Math.random() * Math.floor(9))];
    }
});
