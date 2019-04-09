pragma solidity ^0.5.0;

interface IColourGenerator {
    function generate(address _sender)
    external
    returns (uint256 exteriorColorway, uint256 backgroundColorway);
}
