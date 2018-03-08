const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", (accounts) => {

  let splitter;
  beforeEach(() => {
    return Splitter.new().then(instance => {
      splitter = instance;
    });
  });

  describe("should reject distribute calls with bad input data", () => {

    it("should reject a 0 value transfer", () => {
      return splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: 0 })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert on 0 balance transfer");
        });
    });

    it("should reject a transfer including a split to the sending address", () => {
      var p1 = splitter.distribute(accounts[0], accounts[1], { from: accounts[0], value: web3.toWei(1, "gwei" ) })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when transfer includes own address");
        });

      var p2 = splitter.distribute(accounts[1], accounts[0], { from: accounts[0], value: web3.toWei(1, "gwei" ) })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when transfer includes own address");
        });

      return Promise.all([p1, p2]);
    });

    it ("should reject a transfer including a split to the same split addresses", () => {
      return splitter.distribute(accounts[1], accounts[1], { from: accounts[0], value: web3.toWei(1, "gwei") })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when attempting to transfer to same split addresses");
        });
    });

    it("should reject a transfer to a 0 address", () => {
      return splitter.distribute(0, 0, { from: accounts[0], value: web3.toWei(1, "gwei") })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when attempting to send to a 0 address");
        });
    });

    it("should reject a transfer to a locked contract", () => {
      return splitter.lock()
        .then(() => splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: web3.toWei(1, "gwei") }))
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when attempting to transfer whilst locked");
        });
    });
  });

  describe("should reject withdraw calls with bad input data", () => {

    it("should reject withdraw when user balance is 0", () => {
      splitter.withdraw({ from: accounts[1] })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when attempting to withdraw from a 0 balance account");
        });
    });
  });

  describe("should update user balances successfully", () => {

    it("should evenly split user balances", () => {
      let userBalance1;
      let userBalance2;

      return splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: web3.toWei(0.5, "ether") })
        .then(() => splitter.userBalances(accounts[1]))
        .then(_ub1 => {
          userBalance1 = _ub1;
        })
        .then(() => splitter.userBalances(accounts[2]))
        .then(_ub2 => {
          userBalance2 = _ub2;
        })
        .then(() => assert.equal(userBalance1.toNumber(), userBalance1.toNumber()))
        .then(() => assert.equal(userBalance1.toNumber(), web3.toWei(0.25, "ether")))
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });
    });

    it("should evenly split user balances with a remainder going to sender", () => {
      let userBalance1;
      let userBalance2;

      return splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: 3 })
        .then(() => splitter.userBalances(accounts[1]))
        .then(_ub1 => {
          userBalance1 = _ub1;
        })
        .then(() => splitter.userBalances(accounts[2]))
        .then(_ub2 => {
          userBalance2 = _ub2;
        })
        .then(() => assert.equal(userBalance1.toNumber(), userBalance1.toNumber()))
        .then(() => assert.equal(userBalance1.toNumber(), 1))
        .then(() => splitter.userBalances(accounts[0]))
        .then((userBalance0) => assert.equal(userBalance0, 1))
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });
    });
  });
});