const Promise = require("bluebird");
const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", (accounts) => {

  let splitter;
  beforeEach(() => {
    return Splitter.new({ from: accounts[0] }).then(instance => {
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
      const p1 = splitter.distribute(accounts[0], accounts[1], { from: accounts[0], value: web3.toWei(1, "gwei" ) })
        .then(assert.fail)
        .catch(err => {
          assert.include(err.message, "revert", "should revert when transfer includes own address");
        });

      const p2 = splitter.distribute(accounts[1], accounts[0], { from: accounts[0], value: web3.toWei(1, "gwei" ) })
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

      return splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: web3.toWei(0.5, "ether") })
        .then(() => splitter.userBalances(accounts[1]))
        .then(_ub1 => {
          userBalance1 = _ub1;
        })
        .then(() => splitter.userBalances(accounts[2]))
        .then(userBalance2 => {
          assert(userBalance1.eq(userBalance2));
          assert(userBalance1.eq(web3.toWei(0.25, "ether")));
        })
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });
    });

    it("should evenly split user balances with a remainder going to sender", () => {

      return splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: 3 })
        .then(() => splitter.userBalances(accounts[1]))
        .then(userBalance1 => assert(userBalance1.eq(1)))
        .then(() => splitter.userBalances(accounts[2]))
        .then(userBalance2 => assert(userBalance2.eq(1)))
        .then(() => splitter.userBalances(accounts[0]))
        .then((userBalance0) => assert(userBalance0.eq(1)))
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });
    });

    it("should fire event when deposit is successful", () => {
      const p1 = Promise.promisify(splitter.allEvents().watch, { context: splitter.allEvents() })()
        .then((event) => assert.include(event.event, "LogDeposit", "didn't receive necessary deposit event"))
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });

      const p2 = splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: 2 })
        .catch(assert.fail);

      return Promise.all([p1, p2]);
    });
  });

  describe("should successfully allow withdrawing of funds", () => {

    it("should withdraw correct user balance", () => {
      let acc1Bal;
      let gasUsed;

      return Promise.promisify(web3.eth.getBalance)(accounts[1])
        .then((_acc1Bal) => {
          acc1Bal = _acc1Bal;
        })
        .then(() => splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: web3.toWei(1, "ether") }))
        .then(() => splitter.withdraw({ from: accounts[1] }))
        .then((tx) => {
          gasUsed = tx.receipt.gasUsed * 100000000000;
          return Promise.promisify(web3.eth.getBalance)(accounts[1]);
        })
        .then((newBal) => {
          assert(newBal.plus(gasUsed).minus(acc1Bal).eq(parseInt(web3.toWei(0.5, "ether"), 10)));
        })
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });
    });

    it("should fire event when withdrawal is successful", () => {
      const p1 = splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: web3.toWei(1, "ether") })
        .then(() => Promise.promisify(splitter.allEvents().watch, { context: splitter.allEvents() })())
        .then((event) => assert.include(event.event, "LogWithdraw", "didn't receive necessary withdraw event"))
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });

      const p2 = splitter.withdraw({ from: accounts[1] })
        .catch(assert.fail);

      return Promise.all([p1, p2]);
    });

    it("should empty user balance for user on withdraw", () => {
      return splitter.distribute(accounts[1], accounts[2], { from: accounts[0], value: web3.toWei(1, "ether") })
        .then(() => splitter.withdraw({ from: accounts[1] }))
        .then(() => splitter.userBalances(accounts[1]))
        .then((newBal) => assert(newBal.eq(0)))
        .catch(err => {
          console.error(err);
          assert.fail(err);
        });
    });
  });
});