pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./generators/Generator.sol";

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

    Generator public generator;

    IBlockCitiesCreator public blockCities;

    mapping(address => uint256) public credits;

    uint256 public totalPurchasesInWei = 0;
    uint256 public pricePerBuildingInWei = 100;

    constructor (Generator _generator, IBlockCitiesCreator _blockCities) public {
        generator = _generator;
        blockCities = _blockCities;
    }

    function mintBuilding() public payable returns (uint256 _tokenId) {
        require(
            credits[msg.sender] > 0 || msg.value >= pricePerBuildingInWei,
            "Must supply at least the required minimum purchase value or have credit"
        );

        uint256 totalCities = blockCities.totalCities();

        uint256 tokenId = blockCities.createBuilding(
        // city
            generator.generate(msg.sender, totalCities),

        // Base
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),

        // Body
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),

        // Roof
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),

        // architect
            msg.sender
        );

        // use credits first
        if (credits[msg.sender] > 0) {
            credits[msg.sender] = credits[msg.sender].sub(1);
            // TODO is this correct?
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
