require("dotenv").config();

const program = require("commander");
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
  address = address || g("PUBLIC_KEY");
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

program.version("0.0.1");

program
  .command("mint <filename> [address]")
  .description("Mint a new token.")
  .action(runMint);

program
  .command("vandalize <tokenId> <tokenContract> <filename>")
  .description("Vandalize a token.")
  .action(runVandalize);

program.parse(process.argv);
