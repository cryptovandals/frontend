require("dotenv").config();

const util = require("util");
const web3 = require("web3");
const chalk = require("chalk");
const SimpleWallet = require("./utils");
const IPFS = require("ipfs-api");

const g = (name, fallback) => process.env[name] || fallback;

const wallet = new SimpleWallet(
  g("PRIVATE_KEY"),
  g("PUBLIC_KEY"),
  g("RPC_ENDPOINT")
);

const ipfs = IPFS("ipfs.infura.io", "5001", { protocol: "https" });

async function run(filename, address) {
  var tokenId;
  const vandalizeMe = await wallet.loadContract("VandalizeMe");

  console.log(chalk`Using {green ${await wallet.getNetworkName()}}
VandalizeMe address {green ${vandalizeMe.options.address}}
Minting a new token from file {green ${filename}}
Address receiving the token {green ${address}}
`);

  const imageRes = await util.promisify(ipfs.util.addFromFs)(filename);
  const tokenJSON = {
    name: "",
    description: "A description",
    image: "https://gateway.ipfs.io/ipfs/" + imageRes[0]["hash"]
  };

  const jsonRes = await ipfs.files.add(Buffer.from(JSON.stringify(tokenJSON)));
  const tokenURI = "https://gateway.ipfs.io/ipfs/" + jsonRes[0]["hash"];

  await wallet.send(vandalizeMe.methods.mint(address, tokenURI));
}

if (process.argv.length < 3) {
  console.log("usage: node cli.js <filename> [address]");
} else {
  run(process.argv[2], process.argv[3] || g("PUBLIC_KEY"));
}
