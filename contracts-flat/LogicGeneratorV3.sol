
// File: contracts/generators/ILogicGenerator.sol

pragma solidity ^0.5.0;

interface ILogicGenerator {
    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special);
}

// File: contracts/generators/LogicGeneratorV3.sol

pragma solidity ^0.5.0;


contract LogicGeneratorV3 is ILogicGenerator {
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

    uint256[] public specialMappings;

    uint256 public specialModulo = 13; // give one every x blocks on average

    address payable public platform;
    address payable public partner;

    modifier onlyPlatformOrPartner() {
        require(msg.sender == platform || msg.sender == partner);
        _;
    }

    constructor (address payable _platform) public {
        platform = _platform;
        partner = msg.sender;
    }

    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special) {
        bytes32 hash = blockhash(block.number);

        uint256 aCity = cityPercentages[_generate(hash, _sender, cityPercentages.length)];

        uint256 aBuilding = cityMappings[aCity][_generate(hash, _sender, cityMappings[aCity].length)];

        uint256 aBase = buildingBaseMappings[aBuilding][_generate(hash, _sender, buildingBaseMappings[aBuilding].length)];
        uint256 aBody = buildingBodyMappings[aBuilding][_generate(hash, _sender, buildingBodyMappings[aBuilding].length)];
        uint256 aRoof = buildingRoofMappings[aBuilding][_generate(hash, _sender, buildingRoofMappings[aBuilding].length)];
        uint256 aSpecial = _getSpecial(hash, _sender);

        emit Generated(aCity, aBuilding, aBase, aBody, aRoof, aSpecial);

        return (aCity, aBuilding, aBase, aBody, aRoof, aSpecial);
    }

    function _getSpecial(bytes32 hash, address _sender) internal returns (uint256) {
        // 1 in X roughly
        if (isSpecial(block.number)) {
            return specialMappings[_generate(hash, _sender, specialMappings.length)];
        }
        return 0;
    }

    function _generate(bytes32 _hash, address _sender, uint256 _max) internal returns (uint256) {
        randNonce++;
        bytes memory packed = abi.encodePacked(_hash, _sender, randNonce);
        return uint256(keccak256(packed)) % _max;
    }

    function isSpecial(uint256 _blocknumber) public view returns (bool) {
        return (_blocknumber % specialModulo) == 0;
    }

    function updateBuildingBaseMappings(uint256 _building, uint256[] memory _params) public onlyPlatformOrPartner {
        buildingBaseMappings[_building] = _params;
    }

    function updateBuildingBodyMappings(uint256 _building, uint256[] memory _params) public onlyPlatformOrPartner {
        buildingBodyMappings[_building] = _params;
    }

    function updateBuildingRoofMappings(uint256 _building, uint256[] memory _params) public onlyPlatformOrPartner {
        buildingRoofMappings[_building] = _params;
    }

    function updateCityPercentages(uint256[] memory _params) public onlyPlatformOrPartner {
        cityPercentages = _params;
    }

    function updateCityMappings(uint256 _cityIndex, uint256[] memory _params) public onlyPlatformOrPartner {
        cityMappings[_cityIndex] = _params;
    }

    function updateSpecialModulo(uint256 _specialModulo) public onlyPlatformOrPartner {
        specialModulo = _specialModulo;
    }

    function updateSpecialMappings(uint256[] memory _params) public onlyPlatformOrPartner {
        specialMappings = _params;
    }
}
