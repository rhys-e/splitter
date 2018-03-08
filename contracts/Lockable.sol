pragma solidity ^0.4.19;

import './Ownable.sol';

contract Lockable is Ownable {

    bool public locked;

    function Lockable() public {
        locked = false;
    }


    modifier isUnlocked() {
      require(locked == false);
      _;
    }

    function lock() public isOwner returns (bool) {
      locked = true;
      return true;
    }

    function unlock() public isOwner returns (bool) {
      locked = false;
      return true;
    }
}