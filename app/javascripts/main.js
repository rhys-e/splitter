export class Main {

  constructor(_Splitter, web3) {
    this.Splitter = _Splitter;
    this.web3 = web3;
  }

  start() {
    this.Splitter.setProvider(web3.currentProvider);

    this.getBalance((balance) => this.updateBalance(balance));
    this.addEventListeners();
  }

  addEventListeners() {
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