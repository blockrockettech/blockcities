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

    event VendingMachineTriggered(
        uint256 indexed _tokenId,
        address indexed _architect
    );

    event CreditAdded(
        address indexed _to
    );

    // TODO allow these to be changed
    LogicGenerator public logicGenerator;
    ColourGenerator public colourGenerator;
    IBlockCitiesCreator public blockCities;

    mapping(address => uint256) public credits;

    uint256 public totalPurchasesInWei = 0;
    uint256 public pricePerBuildingInWei = 100;

    constructor (
        LogicGenerator _logicGenerator,
        ColourGenerator _colourGenerator,
        IBlockCitiesCreator _blockCities
    ) public {

        logicGenerator = _logicGenerator;
        colourGenerator = _colourGenerator;
        blockCities = _blockCities;
    }

    // FIXME add mintBuilding(_to)

    function mintBuilding() public payable returns (uint256 _tokenId) {
        require(
            credits[msg.sender] > 0 || msg.value >= pricePerBuildingInWei,
            "Must supply at least the required minimum purchase value or have credit"
        );

        (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special) = logicGenerator.generate(msg.sender);
        (uint256 exteriorColorway, uint256 windowColorway, uint256 backgroundColourway) = colourGenerator.generate(msg.sender);

        uint256 tokenId = blockCities.createBuilding(
            exteriorColorway,
            windowColorway,
            city,
            base,
            body,
            roof,
            special,
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
