pragma solidity ^0.4.19;

contract Ownable {

    address onlyOwner;

    function Ownable() public {
        onlyOwner = msg.sender;
    }

    modifier isOwner() {
      require(msg.sender == onlyOwner);
      _;
    }
}