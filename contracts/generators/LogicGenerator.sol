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

    mapping(uint256 => uint256[]) internal cityMappings;
    mapping(uint256 => uint256[]) internal buildingMappings;

    uint256 constant specialModulo = 3;

    constructor () public {
        cityMappings[0] = [2, 5];
        // ATL
        cityMappings[1] = [0, 4, 6, 7, 8];
        // NYC
        cityMappings[2] = [1, 3, 9];
        // CHI

        buildingMappings[0] = [5, 9, 7];
        buildingMappings[1] = [6, 3, 5];
        buildingMappings[2] = [6, 3, 6];
        buildingMappings[3] = [3, 9, 6];
        buildingMappings[4] = [6, 6, 8];
        buildingMappings[5] = [6, 12, 3];
        buildingMappings[6] = [5, 4, 1];
        buildingMappings[7] = [4, 5, 3];
        buildingMappings[8] = [5, 8, 1];
        buildingMappings[9] = [2, 6, 4];
        buildingMappings[10] = [6, 9, 4];
        buildingMappings[11] = [5, 3, 5];
        buildingMappings[12] = [6, 11, 7];
        buildingMappings[13] = [6, 8, 7];
        buildingMappings[14] = [4, 12, 4];
        buildingMappings[15] = [5, 5, 3];
    }

    function generate(address _sender)
    external
    returns (uint256 city, uint256 building, uint256 base, uint256 body, uint256 roof, uint256 special) {
        bytes32 hash = blockhash(block.number);

        uint256 aCity = generate(hash, _sender, 3);

        uint256 aBuilding = cityMappings[city][generate(hash, _sender, cityMappings[city].length)];
        uint256 aBase = generate(hash, _sender, buildingMappings[building][0]);
        uint256 aBody = generate(hash, _sender, buildingMappings[building][1]);
        uint256 aRoof = generate(hash, _sender, buildingMappings[building][2]);
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

    function isSpecial(uint256 _blocknumber) public pure returns (bool) {
        return _blocknumber % specialModulo == 0;
    }

    function updateBuildingMapping(uint256 _building, uint256[3] memory _params) public onlyOwner {
        buildingMappings[_building] = _params;
    }
}
