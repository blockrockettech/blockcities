pragma solidity ^0.5.0;

interface IValidator {
    function validate(uint256 _building, uint256 _base, uint256 _body, uint256 _roof) external view returns (bool);
}