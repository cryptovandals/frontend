(async function() {
  function generateAddressesFromSeed(seed, count) {
    let bip39 = require("bip39");
    let hdkey = require("ethereumjs-wallet/hdkey");
    let hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(seed));
    let wallet_hdpath = "m/44'/60'/0'/0/";

    let accounts = [];
    for (let i = 0; i < 10; i++) {
      let wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
      let address = "0x" + wallet.getAddress().toString("hex");
      let privateKey = wallet.getPrivateKey().toString("hex");
      accounts.push({ address: address, privateKey: privateKey });
    }

    return accounts;
  }

  // ganache-cli -p 8545 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" -i 15 --gasLimit 50000000
  const seed =
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
  const account = generateAddressesFromSeed(seed, 1)[0];
  console.log(account);

  const Web3 = require("web3");
  const Tx = require("ethereumjs-tx");
  const VandalizeMe = require("./app/scripts/VandalizeMe.json");
  // change this when you deploy
  const vandalizeMeContractAddress =
    "0xf25186b5081ff5ce73482ad761db0eb0d25abfbf";
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  const vandalizeMe = new web3.eth.Contract(
    VandalizeMe,
    vandalizeMeContractAddress
  );

  web3.eth.getTransactionCount(account.address).then(function(count) {
    var amount = web3.utils.toHex(1e16);
    //creating raw tranaction
    var rawTransaction = {
      from: account.address,
      gasPrice: web3.utils.toHex(20 * 1e9),
      gasLimit: web3.utils.toHex(210000),
      to: vandalizeMeContractAddress,
      value: "0x0",
      data: vandalizeMe.methods
        .mint(account.address, "https://example.com")
        .encodeABI(),
      nonce: web3.utils.toHex(count)
    };
    console.log(rawTransaction);
    //creating tranaction via ethereumjs-tx
    var transaction = new Tx(rawTransaction);
    //signing transaction with private key
    var privateKey = Buffer.from(account.privateKey, "hex");
    transaction.sign(privateKey);
    //sending transacton via web3js module
    web3.eth.sendSignedTransaction(
      "0x" + transaction.serialize().toString("hex")
    );
  });
})();
