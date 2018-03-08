const Splitter = artifacts.require("./Splitter.sol");

contract("Splitter", (accounts) => {

  let splitter;
  beforeEach(() => {
    return Splitter.new().then(instance => {
      splitter = instance;
    });
  });

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
});