pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";

import "./libs/Strings.sol";
import "./IBlockCitiesCreator.sol";

contract BlockCities is ERC721Full, WhitelistedRole, IBlockCitiesCreator {
    using SafeMath for uint256;

    // TODO how to handle changing BASE API URI?
    string public tokenBaseURI = "https://api.blockcitties.co";

    event BuildingMinted(
        uint256 indexed _tokenId,
        address indexed _to,
        address indexed _architect, // why have both _architect & _to - they are both the same for now?
        string _tokenURI // TODO dont include _tokenURI as can be looked up?
    );

    event CityAdded(
        uint256 indexed _cityId,
        bytes32 _cityName // TODO dont include _cityName as can be looked up?
    );

    uint256 public totalBuildings = 0;
    uint256 public cityPointer = 0;
    uint256 public tokenIdPointer = 0;

    struct Building {
        uint256 city;

        // TODO should each section be a struct?

        uint256 base;
        uint256 baseExteriorColorway;
        uint256 baseWindowColorway;

        uint256 body;
        uint256 bodyExteriorColorway;
        uint256 bodyWindowColorway;

        uint256 roof;
        uint256 roofExteriorColorway;
        uint256 roofWindowColorway;

        address architect;
    }

    mapping(uint256 => Building) internal buildings;

    mapping(uint256 => bytes32) public cities;

    constructor () public ERC721Full("BlockCities", "BKC") {
        super.addWhitelisted(msg.sender);
    }

    function createBuilding(
        uint256 _city,
        uint256 _base,
        uint256 _baseExteriorColorway,
        uint256 _baseWindowColorway,
        uint256 _body,
        uint256 _bodyExteriorColorway,
        uint256 _bodyWindowColorway,
        uint256 _roof,
        uint256 _roofExteriorColorway,
        uint256 _roofWindowColorway,
        address _architect
    )
    public onlyWhitelisted returns (uint256 _tokenId) {

        // Get next token ID
        uint256 tokenId = tokenIdPointer.add(1);
        require(!_exists(tokenId), "Building exists with token ID");

        // Reset token pointer
        tokenIdPointer = tokenId;

        // Create building
        buildings[tokenId] = Building({
            city : _city,

            // Base
            base : _base,
            baseExteriorColorway : _baseExteriorColorway,
            baseWindowColorway : _baseWindowColorway,

            // Body
            body : _body,
            bodyExteriorColorway : _bodyExteriorColorway,
            bodyWindowColorway : _bodyWindowColorway,

            // Roof
            roof : _roof,
            roofExteriorColorway : _roofExteriorColorway,
            roofWindowColorway : _roofWindowColorway,

            architect : _architect
            });

        // Create dynamic string URL
        string memory _tokenURI = Strings.strConcat(tokenBaseURI, "/token/", Strings.uint2str(tokenId));

        // mint the actual token magic
        _mint(_architect, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Bump generated building
        totalBuildings = totalBuildings.add(1);

        emit BuildingMinted(tokenId, _architect, _architect, _tokenURI);

        return tokenId;
    }

    // TODO add all attributes to this
    function attributes(uint256 _tokenId) public view returns (uint256, uint256, uint256, uint256, address) {
        Building storage building = buildings[_tokenId];
        return (building.city, building.base, building.body, building.roof, building.architect);
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _tokensOfOwner(owner);
    }

    function nextTokenId() public view returns (uint256 _nextTokenID) {
        return tokenIdPointer.add(1);
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

    function setTokenURI(uint256 _tokenId, string memory _tokenUri) public onlyWhitelisted {
        require(bytes(_tokenUri).length != 0, "URI invalid");
        _setTokenURI(_tokenId, _tokenUri);
    }

    function updateTokenBaseURI(string memory _newBaseURI) public onlyWhitelisted {
        require(bytes(_newBaseURI).length != 0, "Base URI invalid");
        tokenBaseURI = _newBaseURI;
    }
}
