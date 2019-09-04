pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IColourGenerator.sol";


contract ColourGeneratorV2 is IColourGenerator {

    uint256 internal randNonce = 0;

    event Colours(uint256 exteriorColorway, uint256 backgroundColorway);

    modifier onlyPlatformOrPartner() {
        require(msg.sender == _platform || msg.sender == _partner);
        _;
    }

    uint256[] public exteriorPercentages;
    uint256 public backgrounds = 8; // preston wants this percentage based

    address payable public platform;
    address payable public partner;
    constructor (address payable _platform, address payable _partner) public {
        platform = _platform;
        partner = _partner;
    }

    function generate(address _sender)
    external
    returns (uint256 exteriorColorway, uint256 backgroundColorway) {
        bytes32 hash = blockhash(block.number);

        uint256 exteriorColorwayRandom = exteriorPercentages[_generate(hash, _sender, cityPercentages.length)];
        uint256 backgroundColorwayRandom = generate(hash, _sender, backgrounds);

        emit Colours(exteriorColorwayRandom, backgroundColorwayRandom);

        return (exteriorColorwayRandom, backgroundColorwayRandom);
    }

    function generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }

    function updateBackgrounds(uint256 _backgrounds) public onlyPlatformOrPartner {
        backgrounds = _backgrounds;
    }

    function updateExteriorPercentages(uint256[] memory _params) public onlyPlatformOrPartner {
        exteriorPercentages = _params;
    }
}
