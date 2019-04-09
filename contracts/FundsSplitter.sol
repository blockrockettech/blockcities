pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FundsSplitter is WhitelistedRole {
    using SafeMath for uint256;

    address payable public blockcities;
    address payable public partner;

    uint256 public partnerRate = 15;

    constructor (address payable _blockcities, address payable _partner) public {
        blockcities = _blockcities;
        partner = _partner;
    }

    function splitFunds(uint256 _totalPrice) internal {
        if (msg.value > 0) {
            uint256 refund = msg.value.sub(_totalPrice);

            // overpaid...
            if (refund > 0) {
                msg.sender.transfer(refund);
            }

            // work out the amount to split and send it
            uint256 partnerAmount = _totalPrice.div(100).mul(partnerRate);
            partner.transfer(partnerAmount);

            // send remaining amount to blockCities wallet
            uint256 remaining = _totalPrice.sub(partnerAmount);
            blockcities.transfer(remaining);
        }
    }

    function updatePartnerAddress(address payable _partner) onlyWhitelisted public {
        partner = _partner;
    }

    function updatePartnerRate(uint256 _techPartnerRate) onlyWhitelisted public {
        partnerRate = _techPartnerRate;
    }

    function updateBlockcitiesAddress(address payable _blockcities) onlyWhitelisted public {
        blockcities = _blockcities;
    }
}
