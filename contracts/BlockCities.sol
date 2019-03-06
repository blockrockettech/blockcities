pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

import "./libs/Strings.sol";
import "./IBlockCitiesCreator.sol";
import "./erc721/CustomERC721Full.sol";

contract BlockCities is CustomERC721Full, WhitelistedRole, IBlockCitiesCreator {
    using SafeMath for uint256;

    string public tokenBaseURI = "";

    event BuildingMinted(
        uint256 indexed _tokenId,
        address indexed _to,
        address indexed _architect
    );

    event CityAdded(
        uint256 indexed _cityId,
        bytes32 _cityName
    );

    uint256 public totalBuildings = 0;
    uint256 public cityPointer = 0;
    uint256 public tokenIdPointer = 0;

    struct Building {
        uint256 exteriorColorway;
        uint256 windowColorway;
        uint256 city;
        uint256 base;
        uint256 body;
        uint256 roof;
        uint256 special;
        address architect;
    }

    mapping(uint256 => Building) internal buildings;

    mapping(uint256 => bytes32) public cities;

    constructor (string memory _tokenBaseURI) public CustomERC721Full("BlockCities", "BKC") {
        super.addWhitelisted(msg.sender);
        tokenBaseURI = _tokenBaseURI;
    }

    function createBuilding(
        uint256 _exteriorColorway,
        uint256 _windowColorway,
        uint256 _city,
        uint256 _base,
        uint256 _body,
        uint256 _roof,
        uint256 _special,
        address _architect
    )
    public onlyWhitelisted returns (uint256 _tokenId) {
        uint256 tokenId = tokenIdPointer.add(1);

        // Reset token pointer
        tokenIdPointer = tokenId;

        // Create building
        buildings[tokenId] = Building({
            exteriorColorway : _exteriorColorway,
            windowColorway : _windowColorway,
            city : _city,
            base : _base,
            body : _body,
            roof : _roof,
            special: _special,
            architect : _architect
            });

        totalBuildings = totalBuildings.add(1);

        // mint the actual token magic
        _mint(_architect, tokenId);

        emit BuildingMinted(tokenId, _architect, _architect);

        return tokenId;
    }

    /**
     * @dev Returns an URI for a given token ID
     * Throws if the token ID does not exist. May return an empty string.
     * @param tokenId uint256 ID of the token to query
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId));
        return Strings.strConcat(tokenBaseURI, Strings.uint2str(tokenId));
    }

    function attributes(uint256 _tokenId) public view returns (
        uint256 _exteriorColorway,
        uint256 _windowColorway,
        uint256 _city,
        uint256 _base,
        uint256 _body,
        uint256 _roof,
        uint256 _special,
        address _architect
    ) {
        require(_exists(_tokenId), "Token ID not found");
        Building storage building = buildings[_tokenId];

        return (
        building.exteriorColorway,
        building.windowColorway,
        building.city,
        building.base,
        building.body,
        building.roof,
        building.special,
        building.architect
        );
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }

    function totalCities() public view returns (uint256 _total) {
        return cityPointer;
    }

    function addCity(bytes32 _cityName) public onlyWhitelisted returns (bool) {
        cities[cityPointer] = _cityName;

        emit CityAdded(cityPointer, _cityName);

        cityPointer = cityPointer.add(1);

        return true;
    }

    function burn(uint256 _tokenId) public onlyWhitelisted returns (bool) {
        _burn(_tokenId);
        return true;
    }

    function updateTokenBaseURI(string memory _newBaseURI) public onlyWhitelisted {
        require(bytes(_newBaseURI).length != 0, "Base URI invalid");
        tokenBaseURI = _newBaseURI;
    }
}
