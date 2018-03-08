export class Main {

  constructor(_Splitter, web3) {
    this.Splitter = _Splitter;
    this.web3 = web3;
    console.log(web3.personal.listAccounts);
    this.senderAddress = web3.personal.listAccounts[0];
  }

  start() {
    this.Splitter.setProvider(web3.currentProvider);

    this.getContractBalance((balance) => this.updateContractBalance(balance));
    this.addContractEventListeners();

    this.populateSenderAddress();
    this.updateSenderBalance();
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

  updateRecipientBalances() {
    const userA = document.getElementById("user1").value;
    const userB = document.getElementById("user2").value;
    this.updateRecipientBalance(userA, "Recipient A");
    this.updateRecipientBalance(userB, "Recipient B");
  }

  updateRecipientBalance(userKey, userName) {
    const container = document.getElementById("balance-container");
    container.innerHTML = "";

    this.Splitter.deployed()
      .then(instance => instance.userBalances(userKey))
      .then(balance => {
        const span = document.createElement("small");
        span.innerHTML = userName + " held balance : ";
        container.appendChild(span);
        const code = document.createElement("code");
        code.innerHTML = this.web3.fromWei(balance, "ether") + " eth";
        container.appendChild(code);
        const br = document.createElement("br");
        container.appendChild(br);
      })
      .catch(error => console.error(error));
  }

  updateSenderBalance() {
    new Promise((resolve, reject) => {
      this.web3.eth.getBalance(this.senderAddress, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    })
      .then(result => {
        document.getElementById("user-balance").innerHTML = this.web3.fromWei(result, "ether") + " eth";
      })
      .then(() => this.Splitter.deployed())
      .then(instance => instance.userBalances(this.senderAddress))
      .then(senderContractBalance => {
        document.getElementById("user-contract-balance").innerHTML = this.web3.fromWei(senderContractBalance, "ether") + " eth";
      })
      .catch(err => console.error(err));
  }

  addEventListeners() {
    document.getElementById("send").addEventListener("click", (event) => {
      const userA = document.getElementById("user1").value;
      const userB = document.getElementById("user2").value;
      const value = document.getElementById("amount").value;

      // todo: allow gas to be controlled
      this.Splitter.deployed()
        .then(instance => instance.distribute(userA, userB,
          { from: this.senderAddress, value: this.web3.toWei(value, "ether"), gas: 4700000 }))
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
            this["event" + result.event](result);
          }
        })
      });
  }

  eventReceivedDeposit(event) {
    console.log(event);
    this.getContractBalance((balance) => this.updateContractBalance(balance));
    this.updateSenderBalance();
    this.updateRecipientBalances();
  }

  updateContractBalance(newBalance) {
    const balance_element = document.getElementById("balance");
    balance_element.innerHTML = this.web3.fromWei(newBalance.valueOf(), "ether");
  }

  getContractBalance(callback) {
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