pragma solidity >=0.5.0 < 0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FundsSplitter is Ownable {
    using SafeMath for uint256;

    // TODO configure this

    address payable public blockCities = address(0x0);
    address payable public techPartner = address(0x0);

    uint256 public techPartnerRate = 40;

    // TODO add new test for this
    function splitFunds() internal {
        // work out the amount to split and send it
        uint256 partnerAmount = msg.value.div(100).mul(techPartnerRate);
        techPartner.transfer(partnerAmount);

        // Sending remaining amount to blockCities wallet
        uint256 remaining = msg.value.sub(partnerAmount);
        blockCities.transfer(remaining);
    }

    function updateTechPartnerAddress(address payable _techPartner) onlyOwner public {
        techPartner = _techPartner;
    }

    function updateTechPartnerRate(uint256 _techPartnerRate) onlyOwner public {
        techPartnerRate = _techPartnerRate;
    }

    function updateBlockCitiesAddress(address payable _blockCities) onlyOwner public {
        blockCities = _blockCities;
    }
}
