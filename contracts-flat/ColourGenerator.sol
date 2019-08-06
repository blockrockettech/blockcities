
// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

pragma solidity ^0.5.0;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor () internal {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    /**
     * @return the address of the owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    /**
     * @return true if `msg.sender` is the owner of the contract.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * @notice Renouncing to ownership will leave the contract without an owner.
     * It will not be possible to call the functions with the `onlyOwner`
     * modifier anymore.
     */
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: contracts/generators/IColourGenerator.sol

pragma solidity ^0.5.0;

interface IColourGenerator {
    function generate(address _sender)
    external
    returns (uint256 exteriorColorway, uint256 backgroundColorway);
}

// File: contracts/generators/ColourGenerator.sol

pragma solidity ^0.5.0;



contract ColourGenerator is Ownable, IColourGenerator {

    uint256 internal randNonce = 0;

    event Colours(uint256 exteriorColorway, uint256 backgroundColorway);

    uint256 public exteriors = 20;
    uint256 public backgrounds = 8;

    function generate(address _sender)
    external
    returns (uint256 exteriorColorway, uint256 backgroundColorway) {
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
