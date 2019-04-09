pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ILogicGenerator.sol";

contract LogicGenerator is Ownable, ILogicGenerator {

    uint256 internal randNonce = 0;

    event Generated(
        uint256 city,
        uint256 building,
        uint256 base,
        uint256 body,
        uint256 roof,
        uint256 special
    );

    uint256[] public cityPercentages;

    mapping(uint256 => uint256[]) public cityMappings;

    mapping(uint256 => uint256[]) public buildingBaseMappings;
    mapping(uint256 => uint256[]) public buildingBodyMappings;
    mapping(uint256 => uint256[]) public buildingRoofMappings;

    uint256 public specialModulo = 7;
    uint256 public specialNo = 11;

    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special) {
        bytes32 hash = blockhash(block.number);

        uint256 aCity = cityPercentages[generate(hash, _sender, cityPercentages.length)];

        uint256 aBuilding = cityMappings[aCity][generate(hash, _sender, cityMappings[aCity].length)];

        uint256 aBase = buildingBaseMappings[aBuilding][generate(hash, _sender, buildingBaseMappings[aBuilding].length)];
        uint256 aBody = buildingBodyMappings[aBuilding][generate(hash, _sender, buildingBodyMappings[aBuilding].length)];
        uint256 aRoof = buildingRoofMappings[aBuilding][generate(hash, _sender, buildingRoofMappings[aBuilding].length)];
        uint256 aSpecial = 0;

        // 1 in X roughly
        if (isSpecial(block.number)) {
            aSpecial = generate(hash, _sender, specialNo);
        }

        emit Generated(aCity, aBuilding, aBase, aBody, aRoof, aSpecial);

        return (aCity, aBuilding, aBase, aBody, aRoof, aSpecial);
    }

    function generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }

    function isSpecial(uint256 _blocknumber) public view returns (bool) {
        return (_blocknumber % specialModulo) == 0;
    }

    function updateBuildingBaseMappings(uint256 _building, uint256[] memory _params) public onlyOwner {
        buildingBaseMappings[_building] = _params;
    }

    function updateBuildingBodyMappings(uint256 _building, uint256[] memory _params) public onlyOwner {
        buildingBodyMappings[_building] = _params;
    }

    function updateBuildingRoofMappings(uint256 _building, uint256[] memory _params) public onlyOwner {
        buildingRoofMappings[_building] = _params;
    }

    function updateSpecialModulo(uint256 _specialModulo) public onlyOwner {
        specialModulo = _specialModulo;
    }

    function updateSpecialNo(uint256 _specialNo) public onlyOwner {
        specialNo = _specialNo;
    }

    function updateCityPercentages(uint256[] memory _params) public onlyOwner {
        cityPercentages = _params;
    }

    function updateCityMappings(uint256 _cityIndex, uint256[] memory _params) public onlyOwner {
        cityMappings[_cityIndex] = _params;
    }

}
