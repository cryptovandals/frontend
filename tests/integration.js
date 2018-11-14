require("dotenv").config();
const SimpleWallet = require("./utils");
const colors = require("colors");

const g = (name, fallback) => process.env[name] || fallback;

const wallet = new SimpleWallet(g("PRIVATE_KEY"));

async function test() {
  vandalizeMe = await wallet.loadContract("VandalizeMe");
  cryptoVandals = await wallet.loadContract("CryptoVandals");

  console.log("Minting a new NFT using VandalizeMe");
  console.log(await wallet.call(vandalizeMe.methods.ownerOf(0)));
  await wallet.send(
    vandalizeMe.methods.mint(wallet.address, "http://example.com")
  );
  await wallet.send(
    vandalizeMe.methods.approve(cryptoVandals.options.address, 0)
  );
  await wallet.send(
    cryptoVandals.methods.mint(
      wallet.address,
      vandalizeMeContract.options.address,
      0,
      0,
      0,
      "http://example.com"
    )
  );
}

test();
