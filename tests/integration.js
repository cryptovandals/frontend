require("dotenv").config();
const SimpleWallet = require("./utils");
const c = require("colors");

const g = (name, fallback) => process.env[name] || fallback;

const wallet = new SimpleWallet(g("PRIVATE_KEY"));

async function test() {
  var tokenId;
  const vandalizeMe = await wallet.loadContract("VandalizeMe");
  const cryptoVandals = await wallet.loadContract("CryptoVandals");

  console.log("Setup values");
  console.log("  User wallet address", wallet.address.green);

  console.log(
    "  VandalizeMe smart contract address",
    vandalizeMe.options.address.green
  );

  console.log(
    "  CryptoVandals smart contract address",
    cryptoVandals.options.address.green
  );

  await wallet.send(
    vandalizeMe.methods.mint(wallet.address, "http://example.com")
  );

  for (tokenId = 0; ; tokenId++) {
    var owner = await wallet.call(vandalizeMe.methods.ownerOf(tokenId));
    if (owner === wallet.address) break;
  }

  console.log(
    " ",
    c.green(await wallet.call(vandalizeMe.methods.ownerOf(tokenId))),
    "owns",
    `${c.red(tokenId)}@${vandalizeMe.options.address.green}`
  );

  console.log("\nstart vandalization\n".rainbow.bold);

  await wallet.send(
    vandalizeMe.methods.approve(cryptoVandals.options.address, tokenId)
  );

  console.log(
    c.green(await wallet.call(vandalizeMe.methods.getApproved(tokenId))),
    "approved to transfer",
    `${c.red(tokenId)}@${vandalizeMe.options.address.green}`
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
    `${c.red(tokenId)}@${vandalizeMe.options.address.green}`
  );
  console.log(
    c.green(await wallet.call(cryptoVandals.methods.ownerOf(tokenId))),
    "owns",
    `${c.red(tokenId)}@${cryptoVandals.options.address.green}`
  );
}

test();
