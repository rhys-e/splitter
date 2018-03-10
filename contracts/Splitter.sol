pragma solidity ^0.4.19;

import './Lockable.sol';

contract Splitter is Lockable {

    mapping (address => uint) public userBalances;

    event LogDeposit(
      uint amount,
      uint splitValue,
      uint remainder,
      address indexed sender,
      address indexed userA,
      address indexed userB);

    event LogWithdraw(
      uint amount,
      address indexed recipient);

    function Splitter() public {
    }

    function distribute(address userA, address userB)
        public
        payable
        isUnlocked
        returns(bool) {

        require(msg.value > 1);
       	require(userA != userB);
       	require(userA != msg.sender);
        require(userB != msg.sender);
       	require(userA != address(0));
       	require(userB != address(0));

        uint remainder = msg.value % 2;
        uint halfValue = msg.value / 2;
        userBalances[userA] += halfValue;
        userBalances[userB] += halfValue;
        userBalances[msg.sender] += remainder;

        LogDeposit(msg.value, halfValue, remainder, msg.sender, userA, userB);

        return true;
    }

    function withdraw() public returns (bool) {
        uint amount = userBalances[msg.sender];
        require(amount > 0);
        userBalances[msg.sender] = 0;

        LogWithdraw(amount, msg.sender);
        msg.sender.transfer(amount);

        return true;
    }
}

