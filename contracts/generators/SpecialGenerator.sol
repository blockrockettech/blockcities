pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract SpecialGenerator is Ownable {

    uint256 internal randNonce = 0;

    event Special(uint256 id);

    function generate(address _sender)
    external
    returns (uint256 special) {
        uint256 res =  generate(_sender, 11);
        emit Special(res);
        return res;
    }

    function generate(address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}
