
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

// File: openzeppelin-solidity/contracts/math/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @title SafeMath
 * @dev Unsigned math operations with safety checks that revert on error
 */
library SafeMath {
    /**
    * @dev Multiplies two unsigned integers, reverts on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
    * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
    * @dev Adds two unsigned integers, reverts on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
    * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
    * reverts when dividing by zero.
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

// File: contracts/generators/CityGenerator.sol

pragma solidity ^0.5.0;



// NOT IN USE CURRENTLY
contract CityGenerator is Ownable {
    using SafeMath for uint256;

    //| NAME          |  | %  | ID
    //----------------------------
    //| San Francisco |  | 5  | 1
    //| Atlanta       |  | 15 | 2
    //| Chicago       |  | 30 | 3
    //| New York City |  | 50 | 4

    uint256 public MAX_VALUE = 100;

    struct Config {
        uint256 id;
        uint256 weight;
    }

    Config[] public configs;

    // Assumes the configs are added in the correct order from lowest probability to highest

    // Downsides:
    // have to add to this in order to use new cities in the main contracts
    // manual config required
    // have to config things in order of least likely to happen
    // is detached from 721 contract (is this needed)

    // Plus side:
    // simple to understand
    // simple to config add/remove/changes
    // cheapish in gas costs (needs more tests)
    // doesnt require knowledge of number of cities in the main contract


    // FIXME add cities via migration
    constructor () public {
        // San Francisco
        configs.push(Config(1, 5));

        // Atlanta
        configs.push(Config(2, 15));

        // Chicago
        configs.push(Config(3, 30));

        // New York City
        configs.push(Config(4, 50));
    }

    uint256 internal nonce = 0;

    event Matched(uint256 id, uint256 weight, uint256 random);

    function generate(address _sender) external returns (uint256) {

        // bump nonce
        nonce++;

        // generate random seed
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, nonce);

        // randomise value
        uint256 random = uint256(keccak256(packed)) % MAX_VALUE;

        uint256 marker = 0;

        // find weighting
        for (uint i = 0; i < configs.length; i++) {
            marker = marker.add(configs[i].weight);

            if (random < marker) {
                emit Matched(configs[i].id, configs[i].weight, random);
                return configs[i].id;
            }
        }

        revert("Unable to find match");
    }

    function getConfigSize() public view returns (uint256) {
        return configs.length;
    }

    function getConfig(uint256 index) public view returns (uint256 value, uint256 weight) {
        return (configs[index].id, configs[index].weight);
    }

    // Dangerous method but needed
    function updateConfig(uint256 configIndex, uint256 weight) public onlyOwner {
        configs[configIndex].weight = weight;
    }

    // This is a kind of hack to make sure it will never match
    function deleteConfig(uint256 configIndex) public onlyOwner {
        configs[configIndex].weight = MAX_VALUE.add(1);
    }

    function updateMaxConfig(uint256 _MAX_VALUE) public onlyOwner {
        MAX_VALUE = _MAX_VALUE;
    }
}
