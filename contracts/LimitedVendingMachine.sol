pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./FundsSplitterV2.sol";
import "./libs/Strings.sol";
import "./IBlockCitiesCreator.sol";

contract LimitedVendingMachine is FundsSplitterV2 {
    using SafeMath for uint256;

    event VendingMachineTriggered(
        uint256 indexed _tokenId,
        address indexed _architect
    );

    event CreditAdded(address indexed _to, uint256 _amount);

    event PriceStepInWeiChanged(
        uint256 _oldPriceStepInWei,
        uint256 _newPriceStepInWei
    );

    event FloorPricePerBuildingInWeiChanged(
        uint256 _oldFloorPricePerBuildingInWei,
        uint256 _newFloorPricePerBuildingInWei
    );

    event CeilingPricePerBuildingInWeiChanged(
        uint256 _oldCeilingPricePerBuildingInWei,
        uint256 _newCeilingPricePerBuildingInWei
    );

    event BlockStepChanged(
        uint256 _oldBlockStep,
        uint256 _newBlockStep
    );

    event LastSaleBlockChanged(
        uint256 _oldLastSaleBlock,
        uint256 _newLastSaleBlock
    );

    event LastSalePriceChanged(
        uint256 _oldLastSalePrice,
        uint256 _newLastSalePrice
    );

//    struct Colour {
//        uint256 exteriorColorway;
//        uint256 backgroundColorway;
//    }
//
//    struct Building {
//        uint256 city;
//        uint256 building;
//        uint256 base;
//        uint256 body;
//        uint256 roof;
//        uint256 special;
//    }

    IBlockCitiesCreator public blockCities;

    mapping(address => uint256) public credits;

    uint256 public totalPurchasesInWei = 0;

    uint256 public floorPricePerBuildingInWei = 0.05 ether;

    uint256 public ceilingPricePerBuildingInWei = 0.15 ether;

    uint256 public priceStepInWei = 0.0003 ether;

    uint256 public blockStep = 10;

    uint256 public lastSaleBlock = 0;
    uint256 public lastSalePrice = 0.075 ether;

    uint256 public buildingMintLimit;
    uint256 public totalBuildings;
    uint256 public city;

    mapping(bytes32 => bool) public buildingRegistry;

    constructor (
        IBlockCitiesCreator _blockCities,
        address payable _platform,
        address payable _partnerAddress,
        uint256 _buildingMintLimit,
        uint256 _city
    ) public FundsSplitterV2(_platform, _partnerAddress) {
        blockCities = _blockCities;

        lastSaleBlock = block.number;

        buildingMintLimit = _buildingMintLimit;

        super.addWhitelisted(msg.sender);

        city = _city;
    }

    function mintBuilding(uint256 _building, uint256 _base, uint256 _body, uint256 _roof,  uint256 _exteriorColorway, uint256 _backgroundColorway) public payable returns (uint256 _tokenId) {
        uint256 currentPrice = totalPrice();
        require(
            credits[msg.sender] > 0 || msg.value >= currentPrice,
            "Must supply at least the required minimum purchase value or have credit"
        );

        _reconcileCreditsAndFunds(currentPrice);

        uint256 tokenId = _generate(_building, _base, _body, _roof, _exteriorColorway, _backgroundColorway);

        _stepIncrease();

        return tokenId;
    }

    function _generate(uint256 _building, uint256 _base, uint256 _body, uint256 _roof, uint256 _exteriorColorway, uint256 _backgroundColorway) internal returns (uint256 _tokenId) {
        require(totalBuildings < buildingMintLimit, "The building mint limit has been reached");

        // validate building can be built at this time

        // check unique and not already built
        bytes32 buildingAndColorwayHash = keccak256(abi.encode(city, _building, _base, _body, _roof, 0, _exteriorColorway, _backgroundColorway));
        require(!buildingRegistry[buildingAndColorwayHash], "Building already exists");

        uint256 tokenId = blockCities.createBuilding(
            _exteriorColorway,
            _backgroundColorway,
            city,
            _building,
            _base,
            _body,
            _roof,
            0,
            msg.sender
        );

        // add to registry to avoid dupes
        buildingRegistry[buildingAndColorwayHash] = true;

        totalBuildings = totalBuildings.add(1);

        emit VendingMachineTriggered(tokenId, msg.sender);

        return tokenId;
    }

    function _reconcileCreditsAndFunds(uint256 _currentPrice) internal {
        // use credits first
        if (credits[msg.sender] >= 1) {
            credits[msg.sender] = credits[msg.sender].sub(1);

            // refund msg.value when using up credits
            if (msg.value > 0) {
                msg.sender.transfer(msg.value);
            }
        } else {
            splitFunds(_currentPrice);
            totalPurchasesInWei = totalPurchasesInWei.add(_currentPrice);
        }
    }

    function _stepIncrease() internal {

        lastSalePrice = totalPrice().add(priceStepInWei);
        lastSaleBlock = block.number;

        if (lastSalePrice >= ceilingPricePerBuildingInWei) {
            lastSalePrice = ceilingPricePerBuildingInWei;
        }
    }

    function totalPrice() public view returns (uint256) {

        uint256 calculatedPrice = lastSalePrice;

        uint256 blocksPassed = block.number - lastSaleBlock;
        uint256 reduce = blocksPassed.div(blockStep).mul(priceStepInWei);

        if (reduce > calculatedPrice) {
            calculatedPrice = floorPricePerBuildingInWei;
        }
        else {
            calculatedPrice = calculatedPrice.sub(reduce);

            if (calculatedPrice < floorPricePerBuildingInWei) {
                calculatedPrice = floorPricePerBuildingInWei;
            }
        }

        return calculatedPrice;
    }

    function setPriceStepInWei(uint256 _priceStepInWei) public onlyWhitelisted returns (bool) {
        emit PriceStepInWeiChanged(priceStepInWei, _priceStepInWei);
        priceStepInWei = _priceStepInWei;
        return true;
    }

    function addCredit(address _to) public onlyWhitelisted returns (bool) {
        credits[_to] = credits[_to].add(1);

        emit CreditAdded(_to, 1);

        return true;
    }

    function addCreditAmount(address _to, uint256 _amount) public onlyWhitelisted returns (bool) {
        credits[_to] = credits[_to].add(_amount);

        emit CreditAdded(_to, _amount);

        return true;
    }

    function setFloorPricePerBuildingInWei(uint256 _floorPricePerBuildingInWei) public onlyWhitelisted returns (bool) {
        emit FloorPricePerBuildingInWeiChanged(floorPricePerBuildingInWei, _floorPricePerBuildingInWei);
        floorPricePerBuildingInWei = _floorPricePerBuildingInWei;
        return true;
    }

    function setCeilingPricePerBuildingInWei(uint256 _ceilingPricePerBuildingInWei) public onlyWhitelisted returns (bool) {
        emit CeilingPricePerBuildingInWeiChanged(ceilingPricePerBuildingInWei, _ceilingPricePerBuildingInWei);
        ceilingPricePerBuildingInWei = _ceilingPricePerBuildingInWei;
        return true;
    }

    function setBlockStep(uint256 _blockStep) public onlyWhitelisted returns (bool) {
        emit BlockStepChanged(blockStep, _blockStep);
        blockStep = _blockStep;
        return true;
    }

    function setLastSaleBlock(uint256 _lastSaleBlock) public onlyWhitelisted returns (bool) {
        emit LastSaleBlockChanged(lastSaleBlock, _lastSaleBlock);
        lastSaleBlock = _lastSaleBlock;
        return true;
    }

    function setLastSalePrice(uint256 _lastSalePrice) public onlyWhitelisted returns (bool) {
        emit LastSalePriceChanged(lastSalePrice, _lastSalePrice);
        lastSalePrice = _lastSalePrice;
        return true;
    }

    function buildingsMintAllowanceRemaining() external view returns (uint256) {
        return buildingMintLimit.sub(totalBuildings);
    }
}
