pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FundsSplitter is Ownable {
    using SafeMath for uint256;

    address payable public blockcities;
    address payable public partner;

    uint256 public partnerRate = 25;

    constructor (address payable _blockcities, address payable _partner) public {
        blockcities = _blockcities;
        partner = _partner;
    }

    function splitFunds() internal {
        if (msg.value > 0) {
            // work out the amount to split and send it
            uint256 partnerAmount = msg.value.div(100).mul(partnerRate);
            partner.transfer(partnerAmount);

            // Sending remaining amount to blockCities wallet
            uint256 remaining = msg.value.sub(partnerAmount);
            blockcities.transfer(remaining);
        }
    }

    function updatePartnerAddress(address payable _partner) onlyOwner public {
        partner = _partner;
    }

    function updatePartnerRate(uint256 _techPartnerRate) onlyOwner public {
        partnerRate = _techPartnerRate;
    }

    function updateBlockcitiesAddress(address payable _blockcities) onlyOwner public {
        blockcities = _blockcities;
    }
}
