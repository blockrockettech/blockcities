pragma solidity >=0.5.0 < 0.6.0;

interface IBlockCitiesCreator {
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
    ) external returns (uint256 _tokenId);

    function nextTokenId() external returns (uint256 _nextTokenID);

    // FIXME is this not needed?
    function totalCities() external returns (uint256 _total);
}
