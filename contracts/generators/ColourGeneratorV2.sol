pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IColourGenerator.sol";


contract ColourGeneratorV2 is IColourGenerator {

    uint256 internal randNonce = 0;

    uint256[] public exteriorPercentages;
    uint256[] public backgroundsPercentages;

    address payable public platform;
    address payable public partner;

    event Colours(uint256 exteriorColorway, uint256 backgroundColorway);

    modifier onlyPlatformOrPartner() {
        require(msg.sender == platform || msg.sender == partner);
        _;
    }

    constructor (address payable _platform) public {
        platform = _platform;
        partner = msg.sender;
    }

    function generate(address _sender)
    external
    returns (uint256 exteriorColorway, uint256 backgroundColorway) {
        bytes32 hash = blockhash(block.number);

        uint256 exteriorColorwayRandom = exteriorPercentages[_generate(hash, _sender, exteriorPercentages.length)];
        uint256 backgroundColorwayRandom = backgroundsPercentages[_generate(hash, _sender, backgroundsPercentages.length)];

        emit Colours(exteriorColorwayRandom, backgroundColorwayRandom);

        return (exteriorColorwayRandom, backgroundColorwayRandom);
    }

    function _generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }

    function updateExteriorPercentages(uint256[] memory _params) public onlyPlatformOrPartner {
        exteriorPercentages = _params;
    }

    function updateBackgroundsPercentages(uint256[] memory _params) public onlyPlatformOrPartner {
        backgroundsPercentages = _params;
    }
}
