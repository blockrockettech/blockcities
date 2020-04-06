pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./generators/IColourGenerator.sol";
import "./generators/ILogicGenerator.sol";

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

    event PriceDiscountBandsChanged(uint256[2] _priceDiscountBands);

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

    struct Colour {
        uint256 exteriorColorway;
        uint256 backgroundColorway;
    }

    struct Building {
        uint256 city;
        uint256 building;
        uint256 base;
        uint256 body;
        uint256 roof;
        uint256 special;
    }

    ILogicGenerator public logicGenerator;

    IColourGenerator public colourGenerator;

    IBlockCitiesCreator public blockCities;

    mapping(address => uint256) public credits;

    uint256 public totalPurchasesInWei = 0;
    uint256[2] public priceDiscountBands = [80, 70];

    uint256 public floorPricePerBuildingInWei = 0.05 ether;

    uint256 public ceilingPricePerBuildingInWei = 0.15 ether;

    uint256 public priceStepInWei = 0.0003 ether;

    uint256 public blockStep = 10;

    uint256 public lastSaleBlock = 0;
    uint256 public lastSalePrice = 0.075 ether;

    uint256 public buildingMintLimit;
    uint256 public totalBuildings;

    constructor (
        ILogicGenerator _logicGenerator,
        IColourGenerator _colourGenerator,
        IBlockCitiesCreator _blockCities,
        address payable _platform,
        address payable _partnerAddress,
        uint256 _buildingMintLimit
    ) public FundsSplitterV2(_platform, _partnerAddress) {
        logicGenerator = _logicGenerator;
        colourGenerator = _colourGenerator;
        blockCities = _blockCities;

        lastSaleBlock = block.number;

        buildingMintLimit = _buildingMintLimit;

        super.addWhitelisted(msg.sender);
    }

    function mintBuilding() public payable returns (uint256 _tokenId) {
        mintBuildingTo(msg.sender);
    }

    function mintBuildingTo(address _to) public payable returns (uint256 _tokenId) {
        uint256 currentPrice = totalPrice(1);
        require(
            credits[msg.sender] > 0 || msg.value >= currentPrice,
            "Must supply at least the required minimum purchase value or have credit"
        );

        _reconcileCreditsAndFunds(currentPrice, 1);

        uint256 tokenId = _generate(_to);

        _stepIncrease();

        return tokenId;
    }

    function _generate(address _to) internal returns (uint256 _tokenId) {
        require(totalBuildings < buildingMintLimit, "The building mint limit has been reached");

        Building memory building = _generateBuilding();
        Colour memory colour = _generateColours();

        // check unique
        bytes32 buildingHash = keccak256(abi.encode(building.city, building.building, building.base, building.body, building.roof, building.special));

        uint256 tokenId = blockCities.createBuilding(
            colour.exteriorColorway,
            colour.backgroundColorway,
            building.city,
            building.building,
            building.base,
            building.body,
            building.roof,
            building.special,
            _to
        );

        // add to registry to avoid dupes

        totalBuildings = totalBuildings.add(1);

        emit VendingMachineTriggered(tokenId, _to);

        return tokenId;
    }

    function _generateColours() internal returns (Colour memory){
        (uint256 _exteriorColorway, uint256 _backgroundColorway) = colourGenerator.generate(msg.sender);

        return Colour({
            exteriorColorway : _exteriorColorway,
            backgroundColorway : _backgroundColorway
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

    function _reconcileCreditsAndFunds(uint256 _currentPrice, uint256 _numberOfBuildings) internal {
        // use credits first
        if (credits[msg.sender] >= _numberOfBuildings) {
            credits[msg.sender] = credits[msg.sender].sub(_numberOfBuildings);

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

        lastSalePrice = totalPrice(1).add(priceStepInWei);
        lastSaleBlock = block.number;

        if (lastSalePrice >= ceilingPricePerBuildingInWei) {
            lastSalePrice = ceilingPricePerBuildingInWei;
        }
    }

    function totalPrice(uint256 _numberOfBuildings) public view returns (uint256) {

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

        if (_numberOfBuildings < 5) {
            return _numberOfBuildings.mul(calculatedPrice);
        }
        else if (_numberOfBuildings < 10) {
            return _numberOfBuildings.mul(calculatedPrice).div(100).mul(priceDiscountBands[0]);
        }

        return _numberOfBuildings.mul(calculatedPrice).div(100).mul(priceDiscountBands[1]);
    }

    function setPriceStepInWei(uint256 _priceStepInWei) public onlyWhitelisted returns (bool) {
        emit PriceStepInWeiChanged(priceStepInWei, _priceStepInWei);
        priceStepInWei = _priceStepInWei;
        return true;
    }

    function setPriceDiscountBands(uint256[2] memory _newPriceDiscountBands) public onlyWhitelisted returns (bool) {
        priceDiscountBands = _newPriceDiscountBands;

        emit PriceDiscountBandsChanged(_newPriceDiscountBands);

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

    function addCreditBatch(address[] memory _addresses, uint256 _amount) public onlyWhitelisted returns (bool) {
        for (uint i = 0; i < _addresses.length; i++) {
            addCreditAmount(_addresses[i], _amount);
        }

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

    function setLogicGenerator(ILogicGenerator _logicGenerator) public onlyWhitelisted returns (bool) {
        logicGenerator = _logicGenerator;
        return true;
    }

    function setColourGenerator(IColourGenerator _colourGenerator) public onlyWhitelisted returns (bool) {
        colourGenerator = _colourGenerator;
        return true;
    }

    function buildingsMintAllowanceRemaining() external view returns (uint256) {
        return buildingMintLimit.sub(totalBuildings);
    }
}
