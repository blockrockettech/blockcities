pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CityGenerator is Ownable {
    using SafeMath for uint256;

    //| NAME          |  | %  | ID
    //----------------------------
    //| San Francisco |  | 5  | 1
    //| Atlanta       |  | 15 | 2
    //| Chicago       |  | 30 | 3
    //| New York City |  | 50 | 4

    uint256 public MAX_VALUE = 100;

    struct Config {
        uint256 id;
        uint256 weight;
    }

    Config[] public configs;

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

    constructor () public {
        // San Francisco
        configs.push(Config(1, 5));

        // Atlanta
        configs.push(Config(2, 15));

        // Chicago
        configs.push(Config(3, 30));

        // New York City
        configs.push(Config(4, 50));
    }

    uint256 internal nonce = 0;

    event Matched(uint256 id, uint256 weight, uint256 random);

    function generate(address _sender) external returns (uint256) {

        // bump nonce
        nonce++;

        // generate random seed
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, nonce);

        // randomise value
        uint256 random = uint256(keccak256(packed)) % MAX_VALUE;

        uint256 marker = 0;

        // find weighting
        for (uint i = 0; i < configs.length; i++) {
            marker = marker.add(configs[i].weight);

            if (random < marker) {
                emit Matched(configs[i].id, configs[i].weight, random);
                return configs[i].id;
            }
        }

        revert("Unable to find match");
    }

    function getConfigSize() public view returns (uint256) {
        return configs.length;
    }

    function getConfig(uint256 index) public view returns (uint256 value, uint256 weight) {
        return (configs[index].id, configs[index].weight);
    }

    // Dangerous method but needed
    function updateConfig(uint256 configIndex, uint256 weight) public onlyOwner {
        configs[configIndex].weight = weight;
    }

    // This is a kind of hack to make sure it will never match
    function deleteConfig(uint256 configIndex) public onlyOwner {
        configs[configIndex].weight = MAX_VALUE.add(1);
    }

    function updateMaxConfig(uint256 _MAX_VALUE) public onlyOwner {
        MAX_VALUE = _MAX_VALUE;
    }
}
