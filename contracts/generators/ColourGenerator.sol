pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ColourGenerator is Ownable {

    uint256 internal randNonce = 0;

    event Colours(uint256 exteriorColorway, uint256 windowColorway, uint256 backgroundColourway);

    function generate(address _sender)
    external
    returns (
        uint256 exteriorColorway,
        uint256 windowColorway,
        uint256 backgroundColourway
    ) {
        bytes32 hash = blockhash(block.number);

        uint256 exteriorColorwayRandom = generate(hash, _sender, 7);
        uint256 windowColorwayRandom = generate(hash, _sender, 3);
        uint256 backgroundColourwayRandom = generate(hash, _sender, 8);

        emit Colours(exteriorColorway,  windowColorway,  backgroundColourway);

        return (exteriorColorwayRandom, windowColorwayRandom, backgroundColourwayRandom);
    }

    function generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}
