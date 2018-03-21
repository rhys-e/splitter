pragma solidity ^0.4.19;

import './Ownable.sol';

contract Lockable is Ownable {

    bool private locked;

    function Lockable() public {
        locked = false;
    }

    modifier isUnlocked() {
      require(locked == false);
      _;
    }

    function isLocked() public view returns (bool) {
      return locked;
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