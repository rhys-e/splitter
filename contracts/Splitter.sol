pragma solidity ^0.4.19;

contract Splitter {

    address owner;
    mapping (address => uint) userBalances;

    function Splitter() public {
        owner = msg.sender;
    }

    modifier restricted() {
        assert (msg.sender == owner);
        _;
    }

    function distribute(address userA, address userB)
        public
        payable
        restricted
        returns(bool) {

        uint amountSplit = msg.value / 2;
        userBalances[userA] += amountSplit;
        userBalances[userB] += amountSplit;
        // todo: handle odd values
        return true;
    }

    function collect() public {
        uint amount = userBalances[msg.sender];
        msg.sender.transfer(amount);
        userBalances[msg.sender] = 0;
    }
}

