require('dotenv').config();
const Web3 = require('web3');
const web3 = new Web3();
const WalletProvider = require('truffle-wallet-provider');
const Wallet = require('ethereumjs-wallet');

const rinkebyPrivateKey = new Buffer(process.env['RINKEBY_PRIVATE_KEY'], 'hex')
const rinkebyWallet = Wallet.fromPrivateKey(rinkebyPrivateKey);
const rinkebyProvider = new WalletProvider(rinkebyWallet, 'https://rinkeby.infura.io/');

module.exports = {
  networks: {
    development: {
      provider: rinkebyProvider,
      gas: 4600000,
      gasPrice: web3.utils.toWei('20', 'gwei'),
      network_id: '4',
    }
  }
};
