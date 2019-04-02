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

    uint256 public totalBuildings = 0;
    uint256 public tokenIdPointer = 0;

    struct Building {
        uint256 exteriorColorway;
        uint256 backgroundColorway;
        uint256 city;
        uint256 building;
        uint256 base;
        uint256 body;
        uint256 roof;
        uint256 special;
        address architect;
    }

    mapping(uint256 => Building) internal buildings;

    constructor (string memory _tokenBaseURI) public CustomERC721Full("BlockCities", "BKC") {
        super.addWhitelisted(msg.sender);
        tokenBaseURI = _tokenBaseURI;
    }

    function createBuilding(
        uint256 _exteriorColorway,
        uint256 _backgroundColorway,
        uint256 _city,
        uint256 _building,
        uint256 _base,
        uint256 _body,
        uint256 _roof,
        uint256 _special,
        address _architect
    )
    public onlyWhitelisted returns (uint256 _tokenId) {
        uint256 tokenId = tokenIdPointer.add(1);

        // reset token pointer
        tokenIdPointer = tokenId;

        // create building
        buildings[tokenId] = Building({
            exteriorColorway : _exteriorColorway,
            backgroundColorway : _backgroundColorway,
            city : _city,
            building: _building,
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
        uint256 _backgroundColorway,
        uint256 _city,
        uint256 _building,
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
        building.backgroundColorway,
        building.city,
        building.building,
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

    function burn(uint256 _tokenId) public onlyWhitelisted returns (bool) {
        _burn(_tokenId);

        delete buildings[_tokenId];

        return true;
    }

    function updateTokenBaseURI(string memory _newBaseURI) public onlyWhitelisted {
        require(bytes(_newBaseURI).length != 0, "Base URI invalid");
        tokenBaseURI = _newBaseURI;
    }
}
