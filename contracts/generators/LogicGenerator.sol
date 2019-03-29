pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

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

    uint256[] internal cityPercentages = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2];

    mapping(uint256 => uint256[]) public cityMappings;

    mapping(uint256 => uint256[]) public buildingMappings;

    uint256 public specialModulo = 7;

    constructor () public {
        // ATL
        cityMappings[0] = [2, 2, 2, 2, 2, 5, 5, 5, 15, 15];

        // NYC
        cityMappings[1] = [0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 6, 7, 8, 8, 8, 8, 14];

        // CHI
        cityMappings[2] = [1, 1, 1, 1, 1, 1, 1, 1, 3, 9, 9, 10, 10, 10, 10, 10, 10, 11, 11, 11];

        // SF
        cityMappings[3] = [12, 13];

        buildingMappings[0] = [6, 9, 8];
        buildingMappings[1] = [7, 3, 7];
        buildingMappings[2] = [7, 3, 7];
        buildingMappings[3] = [3, 9, 4];
        buildingMappings[4] = [7, 6, 9];
        buildingMappings[5] = [7, 12, 5];
        buildingMappings[6] = [6, 4, 5];
        buildingMappings[7] = [4, 5, 4];
        buildingMappings[8] = [6, 8, 1];
        buildingMappings[9] = [2, 6, 5];
        buildingMappings[10] = [7, 9, 5];
        buildingMappings[11] = [7, 3, 6];
        buildingMappings[12] = [7, 11, 6];
        buildingMappings[13] = [7, 8, 8];
        buildingMappings[14] = [5, 12, 5];
        buildingMappings[15] = [6, 5, 6];
    }

    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special) {
        bytes32 hash = blockhash(block.number);

        uint256 aCity = cityPercentages[generate(hash, _sender, cityPercentages.length)];

        uint256 aBuilding = cityMappings[aCity][generate(hash, _sender, cityMappings[aCity].length)];

        uint256 aBase = generate(hash, _sender, buildingMappings[aBuilding][0]);
        uint256 aBody = generate(hash, _sender, buildingMappings[aBuilding][1]);
        uint256 aRoof = generate(hash, _sender, buildingMappings[aBuilding][2]);
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

    function isSpecial(uint256 _blocknumber) public view returns (bool) {
        return _blocknumber % specialModulo == 0;
    }

    function updateBuildingMapping(uint256 _building, uint256[3] memory _params) public onlyOwner {
        buildingMappings[_building] = _params;
    }

    function updateSpecialModulo(uint256 _specialModulo) public onlyOwner {
        specialModulo = _specialModulo;
    }
}
