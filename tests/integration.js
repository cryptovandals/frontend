// @format
require("dotenv").config();
const SimpleWallet = require("./utils");
const web3 = require("web3");
const c = require("colors");

const g = (name, fallback) => process.env[name] || fallback;

const wallet = new SimpleWallet(g("PRIVATE_KEY"), g("PUBLIC_KEY"));

async function test() {
  var tokenId;
  const vandalizeMe = await wallet.loadContract("VandalizeMe");
  const cryptoVandals = await wallet.loadContract("CryptoVandals");

  console.log("Setup values");
  console.log("  User wallet address", c.green(wallet.address));
  console.log(
    "  VandalizeMe smart contract address",
    c.green(vandalizeMe.options.address)
  );
  console.log(
    "  CryptoVandals smart contract address",
    c.green(cryptoVandals.options.address)
  );

  await wallet.send(
    vandalizeMe.methods.mint(wallet.address, "http://example.com")
  );

  for (tokenId = 0; ; tokenId++) {
    var owner = await wallet.call(vandalizeMe.methods.ownerOf(tokenId));
    if (owner === web3.utils.toChecksumAddress(wallet.address)) break;
  }

  console.log(
    " ",
    c.green(await wallet.call(vandalizeMe.methods.ownerOf(tokenId))),
    "owns",
    `${c.red(tokenId)}@${c.green(vandalizeMe.options.address)}`
  );

  console.log("\nstart vandalization\n".rainbow.bold);

  await wallet.send(
    vandalizeMe.methods.approve(cryptoVandals.options.address, tokenId)
  );

  console.log(
    c.green(await wallet.call(vandalizeMe.methods.getApproved(tokenId))),
    "approved to transfer",
    `${c.red(tokenId)}@${c.green(vandalizeMe.options.address)}`
  );

  await wallet.send(
    cryptoVandals.methods.mint(
      wallet.address,
      vandalizeMe.options.address,
      tokenId,
      0,
      0,
      "http://example.com"
    )
  );

  console.log(
    c.green(await wallet.call(vandalizeMe.methods.ownerOf(tokenId))),
    "owns",
    `${c.red(tokenId)}@${c.green(vandalizeMe.options.address)}`
  );
  console.log(
    c.green(await wallet.call(cryptoVandals.methods.ownerOf(tokenId))),
    "owns",
    `${c.red(tokenId)}@${c.green(cryptoVandals.options.address)}`
  );
}

test();
