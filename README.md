Test project. Do not use.

# Splitter
### b9labs Project 1

- Build:
  - `npm install`
  - `truffle develop (compile migrate)`
  - `npm run dev` (open `localhost:8080`)

Goals:

- **there are 3 people: Alice, Bob and Carol.**
- **we can see the balance of the Splitter contract on the Web page.**
- **whenever Alice sends ether to the contract, half of it goes to Bob and the other half to Carol.**
- **we can see the balances of Alice, Bob and Carol on the Web page.**
- **Alice can use the Web page to split her ether.**

Stretch goals:

- **add a kill switch to the whole contract.**
- **make the contract a utility that can be used by David, Emma and anybody with an address to split Ether between any 2 other addresses of their own choice.**
- **cover potentially bad input data.**
- rebuild the Splitter instance state only based on events.
- **do inheritance and import.**

![alt text](https://github.com/rhys-e/splitter/blob/master/splitter.png "Example")
