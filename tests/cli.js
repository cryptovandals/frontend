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

async function runMint(filename, address) {
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

async function runVandalize(tokenId, tokenContract, filename) {
  var tokenId;
  // tokenContract should point to a ERC-721 contract, so we just use
  // the ABI of VandalizeMe.
  const vandalizeMe = await wallet.loadContract("VandalizeMe", tokenContract);
  const cryptoVandals = await wallet.loadContract("CryptoVandals");

  console.log(chalk`Using {green ${await wallet.getNetworkName()}}
CryptoVandals contract {green ${cryptoVandals.options.address}}
Vandalize token {green ${tokenId}}@{green ${tokenContract}}
Minting a new token from file {green ${filename}}
`);

  await wallet.send(
    vandalizeMe.methods.approve(cryptoVandals.options.address, tokenId)
  );

  const imageRes = await util.promisify(ipfs.util.addFromFs)(filename);
  const tokenJSON = {
    name: "",
    description: "A description",
    image: "https://gateway.ipfs.io/ipfs/" + imageRes[0]["hash"]
  };

  const jsonRes = await ipfs.files.add(Buffer.from(JSON.stringify(tokenJSON)));
  const tokenURI = "https://gateway.ipfs.io/ipfs/" + jsonRes[0]["hash"];

  await wallet.send(
    cryptoVandals.methods.mint(
      wallet.address,
      tokenContract,
      tokenId,
      0,
      0,
      tokenURI
    )
  );
}

if (process.argv[2] === "mint") {
  if (process.argv.length < 4) {
    console.log("usage: node cli.js mint <filename> [address]");
  } else {
    runMint(process.argv[3], process.argv[4] || g("PUBLIC_KEY"));
  }
} else if (process.argv[2] === "vandalize") {
  if (process.argv.length < 6) {
    console.log(
      "usage: node cli.js vandalize <tokenId> <tokenContract> <newFile>"
    );
  } else {
    runVandalize(process.argv[3], process.argv[4], process.argv[5]);
  }
} else {
  console.log("usage: node cli.js {mint,vandalize}");
}
