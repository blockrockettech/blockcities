pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./generators/CityGenerator.sol";
import "./generators/BaseGenerator.sol";
import "./generators/BodyGenerator.sol";
import "./generators/RoofGenerator.sol";

import "./FundsSplitter.sol";
import "./libs/Strings.sol";
import "./IBlockCitiesCreator.sol";

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

        (uint256 base, uint256 baseExteriorColorway, uint256 baseWindowColorway) = baseGenerator.generate(city, msg.sender);
        (uint256 body, uint256 bodyExteriorColorway, uint256 bodyWindowColorway) = bodyGenerator.generate(city, msg.sender);
        (uint256 roof, uint256 roofExteriorColorway, uint256 roofWindowColorway) = roofGenerator.generate(city, msg.sender);

        uint256 tokenId = blockCities.createBuilding(
            city,

            base,
            baseExteriorColorway,
            baseWindowColorway,

            body,
            bodyExteriorColorway,
            bodyWindowColorway,

            roof,
            roofExteriorColorway,
            roofWindowColorway,

            msg.sender
        );

        // use credits first
        if (credits[msg.sender] > 0) {
            credits[msg.sender] = credits[msg.sender].sub(1);
            // revert any monies sent
            msg.sender.transfer(msg.value);
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

    // TODO batch add credits

    function addCredit(address _to) public onlyOwner returns (bool) {
        credits[_to] = credits[_to].add(1);

        // FIXME EVENT

        return true;
    }


}
