pragma solidity >=0.5.0 < 0.6.0;

interface IBlockCitiesCreator {
    function createBuilding(
        uint256 _exteriorColorway,
        uint256 _windowColorway,
        uint256 _city,
        uint256 _base,
        uint256 _body,
        uint256 _roof,
        address _architect
    ) external returns (uint256 _tokenId);
}
