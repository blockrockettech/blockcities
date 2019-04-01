pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ColourGenerator is Ownable {

    uint256 internal randNonce = 0;

    event Colours(uint256 exteriorColorway, uint256 backgroundColorway);

    uint256 public exteriors = 20;
    uint256 public backgrounds = 8;

    function generate(address _sender)
    external
    returns (
        uint256 exteriorColorway,
        uint256 backgroundColorway
    ) {
        bytes32 hash = blockhash(block.number);

        uint256 exteriorColorwayRandom = generate(hash, _sender, exteriors);
        uint256 backgroundColorwayRandom = generate(hash, _sender, backgrounds);

        emit Colours(exteriorColorwayRandom, backgroundColorwayRandom);

        return (exteriorColorwayRandom, backgroundColorwayRandom);
    }

    function generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }

    function updateExteriors(uint256 _exteriors) public onlyOwner {
        exteriors = _exteriors;
    }

    function updateBackgrounds(uint256 _backgrounds) public onlyOwner {
        backgrounds = _backgrounds;
    }
}
