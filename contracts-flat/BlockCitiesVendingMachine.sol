pragma solidity ^0.5.0;

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

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

// File: /Users/andy/workspace/blockcities/contracts/generators/CityGenerator.sol

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

// File: /Users/andy/workspace/blockcities/contracts/generators/BaseGenerator.sol

contract BaseGenerator is Ownable {

    uint256 internal randNonce = 0;

    function generate(uint256 _city, address _sender)
    external
    returns (uint256 base) {
        return generate(_sender, 3);
    }

    function generate(address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}

// File: /Users/andy/workspace/blockcities/contracts/generators/BodyGenerator.sol

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

// File: /Users/andy/workspace/blockcities/contracts/generators/RoofGenerator.sol

contract RoofGenerator is Ownable {

    uint256 internal randNonce = 0;

    function generate(uint256 _city, address _sender)
    external
    returns (uint256 base) {

        // TODO THIS IS DUMB FOR NOW, JUST TO PROVE THE POINT

        return generate(_sender, 6);
    }

    function generate(address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(blockhash(block.number), _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}

// File: /Users/andy/workspace/blockcities/contracts/FundsSplitter.sol

contract FundsSplitter is Ownable {
    using SafeMath for uint256;

    // TODO configure this

    address payable public blockCities = address(0x0);
    address payable public techPartner = address(0x0);

    uint256 public techPartnerRate = 40;

    // TODO add new test for this
    function splitFunds() internal {
        // work out the amount to split and send it
        uint256 partnerAmount = msg.value.div(100).mul(techPartnerRate);
        techPartner.transfer(partnerAmount);

        // Sending remaining amount to blockCities wallet
        uint256 remaining = msg.value.sub(partnerAmount);
        blockCities.transfer(remaining);
    }

    function updateTechPartnerAddress(address payable _techPartner) onlyOwner public {
        techPartner = _techPartner;
    }

    function updateTechPartnerRate(uint256 _techPartnerRate) onlyOwner public {
        techPartnerRate = _techPartnerRate;
    }

    function updateBlockCitiesAddress(address payable _blockCities) onlyOwner public {
        blockCities = _blockCities;
    }
}

// File: /Users/andy/workspace/blockcities/contracts/libs/Strings.sol

library Strings {

    // via https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol
    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d, string memory _e) internal pure returns (string memory _concatenatedString) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        uint i = 0;
        for (i = 0; i < _ba.length; i++) {
            babcde[k++] = _ba[i];
        }
        for (i = 0; i < _bb.length; i++) {
            babcde[k++] = _bb[i];
        }
        for (i = 0; i < _bc.length; i++) {
            babcde[k++] = _bc[i];
        }
        for (i = 0; i < _bd.length; i++) {
            babcde[k++] = _bd[i];
        }
        for (i = 0; i < _be.length; i++) {
            babcde[k++] = _be[i];
        }
        return string(babcde);
    }

    function strConcat(string memory _a, string memory _b) internal pure returns (string memory) {
        return strConcat(_a, _b, "", "", "");
    }

    function strConcat(string memory _a, string memory _b, string memory _c) internal pure returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}

// File: /Users/andy/workspace/blockcities/contracts/IBlockCitiesCreator.sol

interface IBlockCitiesCreator {
    function createBuilding(
        uint256 _exteriorColorway,
        uint256 _windowColorway,
        uint256 _city,
        uint256 _base,
        uint256 _body,
        uint256 _roof,
        address _architect
    ) external returns (uint256 _tokenId);
}

// File: contracts/BlockCitiesVendingMachine.sol

contract BlockCitiesVendingMachine is Ownable, FundsSplitter {
    using SafeMath for uint256;

    event PricePerBuildingInWeiChanged(
        uint256 _oldPricePerBuildingInWei,
        uint256 _newPricePerBuildingInWei
    );

    event VendingMachineTriggered(
        uint256 indexed _tokenId,
        address indexed _architect
    );

    event CreditAdded(
        address indexed _to
    );

    // TODO allow these to be changed
    CityGenerator public cityGenerator;
    BaseGenerator public baseGenerator;
    BodyGenerator public bodyGenerator;
    RoofGenerator public roofGenerator;
    IBlockCitiesCreator public blockCities;

    mapping(address => uint256) public credits;

    uint256 public totalPurchasesInWei = 0;
    uint256 public pricePerBuildingInWei = 100;

    constructor (
        CityGenerator _cityGenerator,
        BaseGenerator _baseGenerator,
        BodyGenerator _bodyGenerator,
        RoofGenerator _roofGenerator,
        IBlockCitiesCreator _blockCities
    ) public {
        baseGenerator = _baseGenerator;
        bodyGenerator = _bodyGenerator;
        roofGenerator = _roofGenerator;
        cityGenerator = _cityGenerator;
        blockCities = _blockCities;
    }

    function mintBuilding() public payable returns (uint256 _tokenId) {
        require(
            credits[msg.sender] > 0 || msg.value >= pricePerBuildingInWei,
            "Must supply at least the required minimum purchase value or have credit"
        );

        uint256 city = cityGenerator.generate(msg.sender);

        (uint256 body, uint256 exteriorColorway, uint256 windowColorway) = bodyGenerator.generate(city, msg.sender);
        uint256 base = baseGenerator.generate(city, msg.sender);
        uint256 roof = roofGenerator.generate(city, msg.sender);

        uint256 tokenId = blockCities.createBuilding(
            exteriorColorway,
            windowColorway,
            city,
            base,
            body,
            roof,
            msg.sender
        );

        // use credits first
        if (credits[msg.sender] > 0) {
            credits[msg.sender] = credits[msg.sender].sub(1);
        } else {
            totalPurchasesInWei = totalPurchasesInWei.add(msg.value);
        }

        // Split funds accordingly
        splitFunds();

        emit VendingMachineTriggered(tokenId, msg.sender);

        return tokenId;
    }

    function setPricePerBuildingInWei(uint256 _newPricePerBuildingInWei) public onlyOwner returns (bool) {
        emit PricePerBuildingInWeiChanged(pricePerBuildingInWei, _newPricePerBuildingInWei);

        pricePerBuildingInWei = _newPricePerBuildingInWei;

        return true;
    }

    function addCredit(address _to) public onlyOwner returns (bool) {
        credits[_to] = credits[_to].add(1);

        emit CreditAdded(_to);

        return true;
    }

    function addCreditBatch(address[] memory _addresses) public onlyOwner returns (bool) {
        for (uint i = 0; i < _addresses.length; i++) {
            addCredit(_addresses[i]);
        }
    }
}
