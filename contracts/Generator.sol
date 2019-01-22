pragma solidity >=0.5.0 < 0.6.0;


contract Generator {

    uint256 internal randNonce = 0;

    function generate(address _sender, uint256 _max) public returns (uint) {
        randNonce++;
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}
