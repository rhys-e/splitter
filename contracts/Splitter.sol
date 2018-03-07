pragma solidity ^0.4.19;

contract Splitter {

    address onlyOwner;
    mapping (address => uint) public userBalances;

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

        uint halfValue = msg.value / 2;
        userBalances[userA] += halfValue;
        userBalances[userB] += halfValue;
        userBalances[msg.sender] += msg.value % 2;

        return true;
    }

    function collect() public {
        uint amount = userBalances[msg.sender];
        msg.sender.transfer(amount);
        userBalances[msg.sender] = 0;
    }
}

