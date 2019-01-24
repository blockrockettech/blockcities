pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Generator.sol";

contract BlockCities is ERC721Full, ERC721MetadataMintable, Ownable {

    event BuildingMinted(
        uint256 indexed _tokenId,
        address indexed _to,
        address _architect,
        string _tokenURI
    );

    event BuildingTransfer(
        uint256 indexed _tokenId,
        address indexed _to,
        address _architect,
        string _tokenURI
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

    mapping(address => uint256) public credits;

    constructor (Generator _generator) public ERC721Full("BlockCities", "BKC") {
        generator = _generator;

        addCity("Atlanta");
        addCity("Chicago");
    }

    function mintBuilding(uint256 _tokenId, string memory _tokenURI) public payable returns (bool) {
        require(!_exists(_tokenId), "Building exists with token ID");
        require(
            credits[msg.sender] > 0 || msg.value >= pricePerBuildingInWei,
            "Must supply at least the required minimum purchase value or have credit"
        );

        buildings[_tokenId] = Building(
            generator.generate(msg.sender, cityPointer),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            generator.generate(msg.sender, 3),
            msg.sender
        );

        _mint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);

        emit BuildingMinted(_tokenId, msg.sender, msg.sender, _tokenURI);

        totalBuildings = totalBuildings.add(1);

        // use credits first
        if (credits[msg.sender] > 0) {
            credits[msg.sender] = credits[msg.sender].sub(1);
            msg.sender.transfer(msg.value);
        }
        else {
            totalPurchasesInWei = totalPurchasesInWei.add(msg.value);
        }

        return true;
    }

    function transferBuilding(
        uint256 _tokenId,
        string memory _tokenURI,
        address _to,
        uint256 _city,
        uint256 _base,
        uint256 _body,
        uint256 _roof
    ) public onlyOwner returns (bool) {
        require(!_exists(_tokenId), "Building exists with token ID");

        buildings[_tokenId] = Building(
            _city,
            _base,
            _body,
            _roof,
            msg.sender
        );

        _mint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);

        emit BuildingTransfer(_tokenId, _to, msg.sender, _tokenURI);

        totalBuildings = totalBuildings.add(1);

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

    function burn(uint256 _tokenId) public onlyOwner returns (bool) {
        _burn(_tokenId);
        return true;
    }

    function addCredit(address _to) public onlyOwner returns (bool) {
        credits[_to] = credits[_to].add(1);

        // FIXME EVENT

        return true;
    }
}
