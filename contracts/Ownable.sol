pragma solidity ^0.4.19;

contract Ownable {

    address private onlyOwner;

    function Ownable() public {
        onlyOwner = msg.sender;
    }

    modifier isOwner() {
      require(msg.sender == onlyOwner);
      _;
    }

    function getOwner() public view returns (address) {
      return onlyOwner;
    }
}