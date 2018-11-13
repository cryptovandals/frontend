require("dotenv").config();
const colors = require("colors");

const g = (name, fallback) => process.env[name] || fallback;

const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const Tx = require("ethereumjs-tx");

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const address = g("PUBLIC_KEY");
const privateKey = Buffer.from(g("PRIVATE_KEY"), "hex");

function loadContract(name) {
  const metadata = require(`../build/contracts/${name}.json`);
  const contractAbi = metadata.abi;
  console.log(metadata.networks);
  const contractAddress = metadata.networks["5777"].address;
  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  return contract;
}

vandalizeMeContract = loadContract("VandalizeMe");
cryptoVandalsContract = loadContract("CryptoVandals");

console.log(
  "VandalizeMe address:",
  colors.green(vandalizeMeContract.options.address)
);
console.log(
  "CryptoVandals address:",
  colors.green(cryptoVandalsContract.options.address)
);

// vandalizeMeContract.getPastEvents('Transfer',
//   {fromBlock: 0, toBlock: 'latest'},
//   (err, data) => console.log(data)
// )

async function mint() {
  console.log("Minting a new NFT using VandalizeMe");
  var count = await web3.eth.getTransactionCount(address);
  var rawTx = {
    from: address,
    to: vandalizeMeContract.options.address,
    nonce: web3.utils.toHex(count),
    gasprice: web3.utils.toHex(web3.utils.toWei("20", "gwei")),
    gasLimit: web3.utils.toHex(2000000),
    data: vandalizeMeContract.methods
      .mint(address, "http://example.com/")
      .encodeABI()
  };
  var tx = new Tx(rawTx);
  tx.sign(privateKey);
  await web3.eth.sendSignedTransaction("0x" + tx.serialize().toString("hex"));

  // console.log(colors.green(address), 'owns',

  count = await web3.eth.getTransactionCount(address);
  rawTx = {
    from: address,
    to: vandalizeMeContract.options.address,
    nonce: web3.utils.toHex(count),
    gasprice: web3.utils.toHex(web3.utils.toWei("20", "gwei")),
    gasLimit: web3.utils.toHex(2000000),
    data: vandalizeMeContract.methods
      .approve(cryptoVandalsContract.options.address, 0)
      .encodeABI()
  };
  tx = new Tx(rawTx);
  tx.sign(privateKey);
  try {
    await web3.eth.sendSignedTransaction("0x" + tx.serialize().toString("hex"));
  } catch (e) {
    console.log(e);
    return;
  }

  count = await web3.eth.getTransactionCount(address);
  console.log(address, vandalizeMeContract.options.address);
  rawTx = {
    from: address,
    to: cryptoVandalsContract.options.address,
    nonce: web3.utils.toHex(count),
    gasprice: web3.utils.toHex(web3.utils.toWei("50", "gwei")),
    gasLimit: web3.utils.toHex(2000000),

    data: cryptoVandalsContract.methods
      .mint(
        address,
        vandalizeMeContract.options.address,
        0,
        0,
        0,
        "http://example.com"
      )
      .encodeABI()
  };
  tx = new Tx(rawTx);
  tx.sign(privateKey);
  console.log(tx.serialize().toString("hex"));
  try {
    await web3.eth.sendSignedTransaction("0x" + tx.serialize().toString("hex"));
  } catch (e) {
    console.log(e);
  }
}

function test() {
  mint();
}

test();
