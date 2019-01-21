pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "./Generator.sol";

contract BlockCities is ERC721Full, ERC721MetadataMintable {

    event BuildingMinted(
        uint256 indexed _tokenId,
        address indexed _architect
    );

    Generator internal generator;

    uint256 public totalBuildings = 0;
    uint256 public totalPurchasesInWei = 0;
    uint256 public tokenPointer = 0;
    uint256 public pricePerBuildingInWei = 100;

    struct Building {
        uint256 base;
        uint256 body;
        uint256 roof;
        address architect;
    }

    mapping(uint256 => Building) internal buildings;

    constructor (Generator _generator) public ERC721Full("BlockCities", "BKC") {
        generator = _generator;
    }

    function mintBuilding() public payable returns (bool) {
        require(msg.value >= pricePerBuildingInWei, "Must supply at least the required minimum purchase value");

        buildings[tokenPointer] = Building(generator.generate(msg.sender), generator.generate(msg.sender), generator.generate(msg.sender), msg.sender);

        _mint(msg.sender, tokenPointer);

        emit BuildingMinted(tokenPointer, msg.sender);

        tokenPointer = tokenPointer.add(1);
        totalBuildings = totalBuildings.add(1);
        totalPurchasesInWei = totalPurchasesInWei.add(msg.value);

        return true;
    }

    function attributes(uint _tokenId) public view returns (uint256, uint256, uint256, address) {
        Building storage building = buildings[_tokenId];
        return (building.base, building.body, building.roof, building.architect);
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }
}
