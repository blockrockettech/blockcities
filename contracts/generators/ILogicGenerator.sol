pragma solidity ^0.5.0;

interface ILogicGenerator {
    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special);
}
