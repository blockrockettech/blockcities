pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "./Generator.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BlockCities is ERC721Full, ERC721MetadataMintable, Ownable {

    event BuildingMinted(
        uint256 indexed _tokenId,
        address indexed _architect
    );

    event CityAdded(
        uint256 indexed _cityId,
        bytes32 _cityName
    );

    event PricePerBuildingInWeiChanged(
        uint256 _oldPricePerBuildingInWei,
        uint256 _newPricePerBuildingInWei
    );

    Generator internal generator;

    uint256 public totalBuildings = 0;
    uint256 public totalPurchasesInWei = 0;
    uint256 public tokenPointer = 0;
    uint256 public pricePerBuildingInWei = 100;

    uint256 internal cityPointer = 0;

    struct Building {
        uint256 city;
        uint256 base;
        uint256 body;
        uint256 roof;
        address architect;
    }

    mapping(uint256 => Building) internal buildings;

    mapping(uint256 => bytes32) public cities;

    constructor (Generator _generator) public ERC721Full("BlockCities", "BKC") {
        generator = _generator;

        addCity("Atlanta");
        addCity("Chicago");
    }

    function mintBuilding() public payable returns (bool) {
        require(msg.value >= pricePerBuildingInWei, "Must supply at least the required minimum purchase value");

        buildings[tokenPointer] = Building(
            generator.generate(msg.sender, cityPointer),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            msg.sender
        );

        _mint(msg.sender, tokenPointer);

        emit BuildingMinted(tokenPointer, msg.sender);

        tokenPointer = tokenPointer.add(1);
        totalBuildings = totalBuildings.add(1);
        totalPurchasesInWei = totalPurchasesInWei.add(msg.value);

        return true;
    }

    function attributes(uint _tokenId) public view returns (uint256, uint256, uint256, uint256, address) {
        Building storage building = buildings[_tokenId];
        return (building.city, building.base, building.body, building.roof, building.architect);
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }

    function addCity(bytes32 _cityName) public onlyOwner returns (bool) {
        cities[cityPointer] = _cityName;

        emit CityAdded(cityPointer, _cityName);

        cityPointer = cityPointer.add(1);

        return true;
    }

    function setPricePerBuildingInWei(uint256 _newPricePerBuildingInWei) public onlyOwner returns (bool) {

        emit PricePerBuildingInWeiChanged(pricePerBuildingInWei, _newPricePerBuildingInWei);

        pricePerBuildingInWei = _newPricePerBuildingInWei;

        return true;
    }
}
