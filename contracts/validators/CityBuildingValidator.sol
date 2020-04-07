pragma solidity ^0.5.0;

contract CityBuildingValidator {

    uint256 city;

    mapping(uint256 => uint256[]) public cityMappings;
    mapping(uint256 => mapping(uint256 => uint256[])) public buildingBaseMappings;
    mapping(uint256 => mapping(uint256 => uint256[])) public buildingBodyMappings;
    mapping(uint256 => mapping(uint256 => uint256[])) public buildingRoofMappings;

    address payable public platform;
    address payable public partner;

    modifier onlyPlatformOrPartner() {
        require(msg.sender == platform || msg.sender == partner);
        _;
    }

    constructor (address payable _platform, uint256 _city) public {
        platform = _platform;
        partner = msg.sender;

        city = _city;
    }

    function validate(uint256 _building, uint256 _base, uint256 _body, uint256 _roof)
    public view
    returns (bool) {
        //        bytes32 hash = blockhash(block.number);

        uint256 rotation = 0;

        uint256[] memory buildingOptions = cityMappings[rotation];
        if (!contains(buildingOptions, _building)) {
            return false;
        }

        uint256[] memory baseOptions = buildingBaseMappings[rotation][_building];
        if (!contains(baseOptions, _base)) {
            return false;
        }

        uint256[] memory bodyOptions = buildingBodyMappings[rotation][_building];
        if (!contains(bodyOptions, _body)) {
            return false;
        }

        uint256[] memory roofOptions = buildingRoofMappings[rotation][_building];
        if (!contains(roofOptions, _roof)) {
            return false;
        }

        return true;
    }

    function contains(uint256[] memory _array, uint256 _val) internal pure returns (bool) {

        bool found = false;
        for (uint i = 0; i < _array.length; i++) {
            if (_array[i] == _val) {
                found = true;
                break;
            }
        }

        return found;
    }

    function updateCityMappings(uint256 _rotation, uint256[] memory _params) public onlyPlatformOrPartner {
        cityMappings[_rotation] = _params;
    }

    function updateBuildingBaseMappings(uint256 _rotation, uint256 _building, uint256[] memory _params) public onlyPlatformOrPartner {
        buildingBaseMappings[_rotation][_building] = _params;
    }

    function updateBuildingBodyMappings(uint256 _rotation, uint256 _building, uint256[] memory _params) public onlyPlatformOrPartner {
        buildingBodyMappings[_rotation][_building] = _params;
    }

    function updateBuildingRoofMappings(uint256 _rotation, uint256 _building, uint256[] memory _params) public onlyPlatformOrPartner {
        buildingRoofMappings[_rotation][_building] = _params;
    }
    //
    //    function buildingBaseMappingsArray(uint256 _building) public view returns (uint256[] memory _buildingBaseMappings) {
    //        return buildingBaseMappings[_building];
    //    }
    //
    //    function buildingBodyMappingsArray(uint256 _building) public view returns (uint256[] memory _buildingBodyMappings) {
    //        return buildingBodyMappings[_building];
    //    }
    //
    //    function buildingRoofMappingsArray(uint256 _building) public view returns (uint256[] memory _buildingRoofMappings) {
    //        return buildingRoofMappings[_building];
    //    }
}

