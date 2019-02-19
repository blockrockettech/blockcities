pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BodyGenerator is Ownable {

    uint256 internal randNonce = 0;

    event Body(uint256 body, uint256 exteriorColorway, uint256 windowColorway);

    function generate(uint256 _city, address _sender)
    external
    returns (
        uint256 body,
        uint256 exteriorColorway,
        uint256 windowColorway
    ) {

        // TODO THIS IS DUMB FOR NOW, JUST TO PROVE THE POINT

        // INCLUDES COLORWAYS
        uint256 bodyRandom = generate(_sender, 12);
        uint256 exteriorColorwayRandom = generate(_sender, 7);
        uint256 windowColorwayRandom = generate(_sender, 3);

        emit Body(bodyRandom, exteriorColorwayRandom, windowColorwayRandom);

        return (bodyRandom, exteriorColorwayRandom, windowColorwayRandom);
    }

    function generate(address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}
