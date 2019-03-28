pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./generators/ColourGenerator.sol";
import "./generators/LogicGenerator.sol";

import "./FundsSplitter.sol";
import "./libs/Strings.sol";
import "./IBlockCitiesCreator.sol";

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

    // FIXME setter for owner to change
    uint256 public floorPricePerBuildingInWei = 0.05 ether;

    // FIXME setter for owner to change
    uint256 public ceilingPricePerBuildingInWei = 0.15 ether;

    // use totalPrice() to calculate current weighted price
    uint256 pricePerBuildingInWei = floorPricePerBuildingInWei;

    // FIXME setter for owner to change
    uint256 public priceStepInWei = 0.01 ether;

    // FIXME setter for owner to change
    uint256 public blockStep = 120;

    // FIXME setter for owner to change
    uint256 public lastSaleBlock = 0;

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
        uint256 currentPrice = totalPrice(1);
        require(
            credits[msg.sender] > 0 || msg.value >= currentPrice,
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(1);
        splitFunds(currentPrice);

        uint256 tokenId = _generate(msg.sender);

        _stepIncrease();

        return tokenId;
    }

    function mintBuildingTo(address _to) public payable returns (uint256 _tokenId) {
        uint256 currentPrice = totalPrice(1);
        require(
            credits[msg.sender] > 0 || msg.value >= currentPrice,
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(1);
        splitFunds(currentPrice);

        uint256 tokenId = _generate(_to);

        _stepIncrease();

        return tokenId;
    }

    function mintBatch(uint256 _numberOfBuildings) public payable returns (uint256[] memory _tokenIds) {
        uint256 currentPrice = totalPrice(_numberOfBuildings);
        require(
            credits[msg.sender] >= _numberOfBuildings || msg.value >= currentPrice,
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(_numberOfBuildings);
        splitFunds(currentPrice);

        uint256[] memory generatedTokenIds = new uint256[](_numberOfBuildings);

        for (uint i = 0; i < _numberOfBuildings; i++) {
            generatedTokenIds[i] = _generate(msg.sender);
        }

        _stepIncrease();

        return generatedTokenIds;
    }

    function mintBatchTo(address _to, uint256 _numberOfBuildings) public payable returns (uint256[] memory _tokenIds) {
        uint256 currentPrice = totalPrice(_numberOfBuildings);
        require(
            credits[msg.sender] >= _numberOfBuildings || msg.value >= currentPrice,
            "Must supply at least the required minimum purchase value or have credit"
        );

        _adjustCredits(_numberOfBuildings);
        splitFunds(currentPrice);

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

    function _adjustCredits(uint256 _numberOfBuildings) internal {
        // use credits first
        if (credits[msg.sender] > 0) {
            credits[msg.sender] = credits[msg.sender].sub(_numberOfBuildings);
        } else {
            totalPurchasesInWei = totalPurchasesInWei.add(msg.value);
        }
    }

    function _stepIncrease() internal {
        pricePerBuildingInWei = pricePerBuildingInWei.add(priceStepInWei);

        if (pricePerBuildingInWei >= ceilingPricePerBuildingInWei) {
            pricePerBuildingInWei = ceilingPricePerBuildingInWei;
        }

        lastSaleBlock = block.number;
    }

    function totalPrice(uint256 _numberOfBuildings) public view returns (uint256) {

        uint256 calculatedPrice = pricePerBuildingInWei;

        uint256 blocksPassed = block.number - lastSaleBlock;
        uint256 reduce = blocksPassed.div(blockStep).mul(priceStepInWei);

        if (reduce > calculatedPrice) {
            calculatedPrice = floorPricePerBuildingInWei;
        }
        else {
            calculatedPrice = calculatedPrice.sub(reduce);
        }

        if (calculatedPrice < floorPricePerBuildingInWei) {
            calculatedPrice = floorPricePerBuildingInWei;
        }

        if (_numberOfBuildings < 5) {
            return _numberOfBuildings.mul(calculatedPrice);
        }
        else if (_numberOfBuildings < 10) {
            return _numberOfBuildings.mul(calculatedPrice).div(100).mul(priceDiscountBands[0]);
        }

        return _numberOfBuildings.mul(calculatedPrice).div(100).mul(priceDiscountBands[1]);
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
