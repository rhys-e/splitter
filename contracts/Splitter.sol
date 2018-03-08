pragma solidity ^0.4.19;

contract Splitter {

    address onlyOwner;
    mapping (address => uint) public userBalances;

    event ReceivedDeposit(
      uint amount,
      uint splitValue,
      uint remainder,
      address indexed sender,
      address indexed userA,
      address indexed userB);

    event ReceivedWithdraw(
      uint amount,
      address indexed recipient);

    function Splitter() public {
        onlyOwner = msg.sender;
    }

    function distribute(address userA, address userB)
        public
        payable
        returns(bool) {

       	require(msg.value > 0);
       	require(userA != userB);
       	require(userA != msg.sender);
       	require(userA != address(0));
       	require(userB != address(0));

        uint remainder = msg.value % 2;
        uint halfValue = msg.value / 2;
        userBalances[userA] += halfValue;
        userBalances[userB] += halfValue;
        userBalances[msg.sender] += remainder;

        ReceivedDeposit(msg.value, halfValue, remainder, msg.sender, userA, userB);

        return true;
    }

    function collect() public {
        uint amount = userBalances[msg.sender];
        require(amount > 0);
        userBalances[msg.sender] = 0;

        ReceivedWithdraw(amount, msg.sender);
        msg.sender.transfer(amount);
    }
}

