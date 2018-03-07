export class Main {

  constructor(_Splitter, web3) {
    this.Splitter = _Splitter;
    this.web3 = web3;
    console.log(web3.personal.listAccounts);
    this.senderAddress = web3.personal.listAccounts[0];
  }

  start() {
    this.Splitter.setProvider(web3.currentProvider);

    this.getBalance((balance) => this.updateBalance(balance));
    this.addContractEventListeners();

    this.populateSenderAddress();
    this.populateSenderBalance();
    Main.populateReceiverAddresses();
    this.addEventListeners();
  }

  static populateReceiverAddresses() {
    const userA = sessionStorage.getItem("user1");
    if (userA) {
      document.getElementById("user1").value = userA;
    }

    const userB = sessionStorage.getItem("user2");
    if (userB) {
      document.getElementById("user2").value = userB;
    }
  }

  populateSenderBalance() {
    this.web3.eth.getBalance(this.senderAddress, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        document.getElementById("user-balance").innerHTML = this.web3.fromWei(result, "ether") + " eth";
      }
    });
  }

  addEventListeners() {
    document.getElementById("send").addEventListener("click", (event) => {
      const userA = document.getElementById("user1").value;
      const userB = document.getElementById("user2").value;
      const value = document.getElementById("amount").value;

      this.Splitter.deployed()
        .then(instance => instance.distribute(userA, userB,
          { from: this.senderAddress, value: this.web3.toWei(value, "ether") }))
        .catch(error => console.error(error));

      sessionStorage.setItem("user1", userA);
      sessionStorage.setItem("user2", userB);
    });
  }

  populateSenderAddress() {
    document.getElementById("user-address").innerHTML = this.senderAddress;
  }

  addContractEventListeners() {
    this.Splitter.deployed()
      .then(instance => instance.allEvents())
      .then(events => {
        events.watch((err, result) => {
          if (err) {
            console.error(err);
          } else {
            this["event" + result.event]();
          }
        })
      });
  }

  eventReceivedDeposit(event) {
    console.log(event);
    this.getBalance((balance) => this.updateBalance(balance));
  }

  updateBalance(newBalance) {
    const balance_element = document.getElementById("balance");
    balance_element.innerHTML = this.web3.fromWei(newBalance.valueOf(), "ether");
  }

  getBalance(callback) {
    this.Splitter.deployed().then((instance) => {
      return instance.address;
    }).then((address) => {
      return new Promise((resolve, reject) => {
        this.web3.eth.getBalance(address, (err, balance) => {
          if (err) {
            reject(err);
          } else {
            resolve(balance);
          }
        });
      });
    }).then((balance) => callback(balance))
    .catch(error => console.error(error));
  }
}