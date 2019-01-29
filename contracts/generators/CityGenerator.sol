pragma solidity >=0.5.0 < 0.6.0;

import "./Generator.sol";

contract CityGenerator {

    //| Atlanta       |  | 15 |
    //| ------------- |  | -- |
    //| Chicago       |  | 30 |
    //| San Francisco |  | 5  |
    //| New York City |  | 50 |

    uint public MAX_VALUE = 100;

    struct Config {
        uint256 value;
        uint256 weight;
    }

    Config[] public configs;

    constructor () public {

        // Assumes the configs are added in the correct order from lowest probability to highest

        // Downsides:
        // have to add to this in order to use new cities in the main contracts
        // manual config required
        // have to config things in order of least likely to happen
        // is detached from 721 contract (is this needed)

        // Plus side:
        // simple to understand
        // simple to config add/remove/changes
        // cheapish in gas costs (needs more tests)
        // doesnt require knowledge of number of cities in the main contract

        //San Francisco
        configs.push(Config(1, 5));
        //Chicago
        configs.push(Config(0, 30));
        //New York City
        configs.push(Config(2, 50));
    }

    uint256 internal nonce = 0;

    function generate(address _sender) public returns (uint256) {

        // generate random seed
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, nonce);

        // randomise value
        uint256 randomPercentage = uint256(keccak256(packed)) % MAX_VALUE;

        // bump nonce
        nonce++;

        // find weighting
        for (uint i = 0; i < configs.length; i++) {
            if (randomPercentage <= configs[i].weight) {
                return configs[i].value;
            }
        }

        // FIXME is this correct

        // return most likely value which should always be value 0
        return configs[configs.length - 1].value;
    }

}
