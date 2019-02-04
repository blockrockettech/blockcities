pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BodyGenerator is Ownable {

    uint256 internal randNonce = 0;

    function generate(uint256 _city, address _sender)
    external
    returns (
        uint256 base,
        uint256 exteriorColorway,
        uint256 windowColorway
    ) {

        // TODO THIS IS DUMB FOR NOW, JUST TO PROVE THE POINT

        // INCLUDES COLORWAYS

        return (
        generate(_sender, 3), // BODY
        generate(_sender, 3), // EXTERIOR
        generate(_sender, 3) // WINDOW
        );
    }

    function generate(address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}
