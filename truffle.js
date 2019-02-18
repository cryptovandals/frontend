require("dotenv").config();

const Web3 = require("web3");
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require("ethereumjs-wallet");

const g = (name, fallback) => process.env[name] || fallback;
const web3 = new Web3();
const privateKey = new Buffer(g("PRIVATE_KEY"), "hex");
const wallet = Wallet.fromPrivateKey(privateKey);
const provider = new WalletProvider(
  wallet,
  g("RPC_ENDPOINT", "http://localhost:8545")
);

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: '*',
    },
    rinkeby: {
      provider: provider,
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "4"
    }
  }
};
