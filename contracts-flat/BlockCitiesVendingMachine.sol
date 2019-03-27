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

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/blockcities/contracts/generators/ColourGenerator.sol

contract ColourGenerator is Ownable {

    uint256 internal randNonce = 0;

    event Colours(uint256 exteriorColorway, uint256 windowColorway);

    function generate(address _sender)
    external
    returns (
        uint256 exteriorColorway,
        uint256 windowColorway
    ) {
        bytes32 hash = blockhash(block.number);

        uint256 exteriorColorwayRandom = generate(hash, _sender, 7);
        uint256 windowColorwayRandom = generate(hash, _sender, 3);

        emit Colours(exteriorColorway,  windowColorway);

        return (exteriorColorwayRandom, windowColorwayRandom);
    }

    function generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }
}

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/blockcities/contracts/generators/LogicGenerator.sol

contract LogicGenerator is Ownable {

    uint256 internal randNonce = 0;

    event Generated(
        uint256 city,
        uint256 building,
        uint256 base,
        uint256 body,
        uint256 roof,
        uint256 special
    );

    mapping(uint256 => uint256[]) internal cityMappings;
    mapping(uint256 => uint256[]) internal buildingMappings;

    uint256 constant specialModulo = 3;

    constructor () public {
        cityMappings[0] = [2, 5];
        // ATL
        cityMappings[1] = [0, 4, 6, 7, 8];
        // NYC
        cityMappings[2] = [1, 3, 9];
        // CHI

        buildingMappings[0] = [5, 9, 7];
        buildingMappings[1] = [6, 3, 5];
        buildingMappings[2] = [6, 3, 6];
        buildingMappings[3] = [3, 9, 6];
        buildingMappings[4] = [6, 6, 7];
        buildingMappings[5] = [6, 12, 3];
        buildingMappings[6] = [5, 4, 1];
        buildingMappings[7] = [4, 5, 3];
        buildingMappings[8] = [5, 8, 1];
        buildingMappings[9] = [2, 6, 4];
    }

    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special) {
        bytes32 hash = blockhash(block.number);

        uint256 aCity = generate(hash, _sender, 3);

        uint256 aBuilding = cityMappings[city][generate(hash, _sender, cityMappings[city].length)];
        uint256 aBase = generate(hash, _sender, buildingMappings[building][0]);
        uint256 aBody = generate(hash, _sender, buildingMappings[building][1]);
        uint256 aRoof = generate(hash, _sender, buildingMappings[building][2]);
        uint256 aSpecial = 0;

        // 1 in 3 roughly
        if (isSpecial(block.number)) {
            aSpecial = generate(hash, _sender, 11);
        }

        emit Generated(aCity, aBuilding, aBase, aBody, aRoof, aSpecial);
        return (aCity, aBuilding, aBase, aBody, aRoof, aSpecial);
    }

    function generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }

    function isSpecial(uint256 _blocknumber) public pure returns (bool) {
        return _blocknumber % specialModulo == 0;
    }
}

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/blockcities/contracts/FundsSplitter.sol

contract FundsSplitter is Ownable {
    using SafeMath for uint256;

    address payable public blockcities;
    address payable public partner;

    uint256 public partnerRate = 25;

    constructor (address payable _blockcities, address payable _partner) public {
        blockcities = _blockcities;
        partner = _partner;
    }

    function splitFunds() internal {
        if (msg.value > 0) {
            // work out the amount to split and send it
            uint256 partnerAmount = msg.value.div(100).mul(partnerRate);
            partner.transfer(partnerAmount);

            // Sending remaining amount to blockCities wallet
            uint256 remaining = msg.value.sub(partnerAmount);
            blockcities.transfer(remaining);
        }
    }

    function updatePartnerAddress(address payable _partner) onlyOwner public {
        partner = _partner;
    }

    function updatePartnerRate(uint256 _techPartnerRate) onlyOwner public {
        partnerRate = _techPartnerRate;
    }

    function updateBlockcitiesAddress(address payable _blockcities) onlyOwner public {
        blockcities = _blockcities;
    }
}

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/blockcities/contracts/libs/Strings.sol

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

// File: /Users/jamesmorgan/Dropbox/workspace-blockrocket/blockcities/contracts/IBlockCitiesCreator.sol

interface IBlockCitiesCreator {
    function createBuilding(
        uint256 _exteriorColorway,
        uint256 _windowColorway,
        uint256 _city,
        uint256 _building,
        uint256 _base,
        uint256 _body,
        uint256 _roof,
        uint256 _special,
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

    event PriceStepInWeiChanged(
        uint256 _oldPriceStepInWei,
        uint256 _newPriceStepInWei
    );

    event VendingMachineTriggered(
        uint256 indexed _tokenId,
        address indexed _architect
    );

    event CreditAdded(
        address indexed _to
    );

    event PriceDiscountBandsChanged(
        uint256[2] _priceDiscountBands
    );

    struct Colour {
        uint256 exteriorColorway;
        uint256 windowColorway;
    }

    struct Building {
        uint256 city;
        uint256 building;
        uint256 base;
        uint256 body;
        uint256 roof;
        uint256 special;
    }

    LogicGenerator public logicGenerator;
    ColourGenerator public colourGenerator;
    IBlockCitiesCreator public blockCities;

    mapping(address => uint256) public credits;

    uint256 public totalPurchasesInWei = 0;
    uint256[2] public priceDiscountBands = [80, 70];

    uint256 public basePricePerBuildingInWei = 0.05 ether;
    uint256 public ceilingPricePerBuildingInWei = 0.15 ether;

    // use totalPrice() to calculate current weighted price
    uint256 internal pricePerBuildingInWei = basePricePerBuildingInWei;

    uint256 public priceStepInWei = 0.01 ether;
    uint256 public lastSale = 0;

    constructor (
        LogicGenerator _logicGenerator,
        ColourGenerator _colourGenerator,
        IBlockCitiesCreator _blockCities
    ) public FundsSplitter(msg.sender, msg.sender) {

        logicGenerator = _logicGenerator;
        colourGenerator = _colourGenerator;
        blockCities = _blockCities;
    }

    function mintBuilding() public payable returns (uint256 _tokenId) {
        require(
            credits[msg.sender] > 0 || msg.value >= totalPrice(1),
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(1);
        splitFunds();

        uint256 tokenId = _generate(msg.sender);

        _stepIncrease();

        return tokenId;
    }

    function mintBuildingTo(address _to) public payable returns (uint256 _tokenId) {
        require(
            credits[msg.sender] > 0 || msg.value >= totalPrice(1),
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(1);
        splitFunds();

        uint256 tokenId = _generate(_to);

        _stepIncrease();

        return tokenId;
    }

    function mintBatch(uint256 _numberOfBuildings) public payable returns (uint256[] memory _tokenIds){
        require(
            credits[msg.sender] >= _numberOfBuildings || msg.value >= totalPrice(_numberOfBuildings),
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(_numberOfBuildings);
        splitFunds();

        uint256[] memory generatedTokenIds = new uint256[](_numberOfBuildings);

        for (uint i = 0; i < _numberOfBuildings; i++) {
            generatedTokenIds[i] = _generate(msg.sender);
        }

        _stepIncrease();

        return generatedTokenIds;
    }

    function mintBatchTo(address _to, uint256 _numberOfBuildings) public payable returns (uint256[] memory _tokenIds){
        require(
            credits[msg.sender] >= _numberOfBuildings || msg.value >= totalPrice(_numberOfBuildings),
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(_numberOfBuildings);
        splitFunds();

        uint256[] memory generatedTokenIds = new uint256[](_numberOfBuildings);

        for (uint i = 0; i < _numberOfBuildings; i++) {
            generatedTokenIds[i] = _generate(_to);
        }

        _stepIncrease();

        return generatedTokenIds;
    }

    function _generate(address _to) internal returns (uint256 _tokenId) {
        Building memory building = _generateBuilding();
        Colour memory colour = _generateColours();

        uint256 tokenId = blockCities.createBuilding(
            colour.exteriorColorway,
            colour.windowColorway,
            building.city,
            building.building,
            building.base,
            building.body,
            building.roof,
            building.special,
            _to
        );

        emit VendingMachineTriggered(tokenId, _to);

        return tokenId;
    }

    function _generateColours() internal returns (Colour memory){
        (uint256 _exteriorColorway, uint256 _windowColorway) = colourGenerator.generate(msg.sender);

        return Colour({
            exteriorColorway : _exteriorColorway,
            windowColorway : _windowColorway
            });
    }

    function _generateBuilding() internal returns (Building memory){
        (uint256 _city, uint256 _building, uint256 _base, uint256 _body, uint256 _roof, uint256 _special) = logicGenerator.generate(msg.sender);

        return Building({
            city : _city,
            building : _building,
            base : _base,
            body : _body,
            roof : _roof,
            special : _special
            });
    }

    function _stepIncrease() internal {
        if (pricePerBuildingInWei.add(priceStepInWei) >= ceilingPricePerBuildingInWei) {
            pricePerBuildingInWei = ceilingPricePerBuildingInWei;
        } else {
            pricePerBuildingInWei = pricePerBuildingInWei.add(priceStepInWei);
        }
    }

    function _adjustCredits(uint256 _numberOfBuildings) internal {
        // use credits first
        if (credits[msg.sender] > 0) {
            credits[msg.sender] = credits[msg.sender].sub(_numberOfBuildings);
        } else {
            totalPurchasesInWei = totalPurchasesInWei.add(msg.value);
        }
    }

    function totalPrice(uint256 _numberOfBuildings) public view returns (uint256) {
        if (_numberOfBuildings < 5) {
            return _numberOfBuildings.mul(pricePerBuildingInWei);
        }
        else if (_numberOfBuildings < 10) {
            return _numberOfBuildings.mul(pricePerBuildingInWei).div(100).mul(priceDiscountBands[0]);
        }
        return _numberOfBuildings.mul(pricePerBuildingInWei).div(100).mul(priceDiscountBands[1]);
    }

    function setPricePerBuildingInWei(uint256 _newPricePerBuildingInWei) public onlyOwner returns (bool) {
        emit PricePerBuildingInWeiChanged(pricePerBuildingInWei, _newPricePerBuildingInWei);

        pricePerBuildingInWei = _newPricePerBuildingInWei;

        return true;
    }

    function setPriceStepInWei(uint256 _newPriceStepInWei) public onlyOwner returns (bool) {
        emit PricePerBuildingInWeiChanged(priceStepInWei, _newPriceStepInWei);

        priceStepInWei = _newPriceStepInWei;

        return true;
    }

    function setPriceDiscountBands(uint256[2] memory _newPriceDiscountBands) public onlyOwner returns (bool) {
        priceDiscountBands = _newPriceDiscountBands;

        emit PriceDiscountBandsChanged(_newPriceDiscountBands);

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
