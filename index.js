const Web3 = require("web3");

let rpcUrl = "https://mainnet.infura.io/ocCdekUYwOyLn7h7OlJM";
var web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
const web3 = 

var event = contract.myEvent();
event.watch((err, res) => {
    console.log(res); // event response
});
