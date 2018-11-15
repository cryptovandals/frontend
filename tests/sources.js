require("dotenv").config();
const SimpleWallet = require("./utils");
const c = require("colors");

const g = (name, fallback) => process.env[name] || fallback;

const wallet = new SimpleWallet(g("PRIVATE_KEY"));

async function test() {
  async function lastTokenId(contract) {
    var last;
    for (tokenId = 0; ; tokenId++) {
      try {
        var owner = await wallet.call(contract.methods.ownerOf(tokenId));
      } catch {
        break;
      }
      if (owner == wallet.address) {
        last = tokenId;
      }
    }
    return last;
  }

  async function mint() {
    await wallet.send(
      vandalizeMe.methods.mint(wallet.address, "http://example.com")
    );
    return await lastTokenId(vandalizeMe);
  }

  async function approve(contract, tokenId) {
    await wallet.send(
      contract.methods.approve(cryptoVandals.options.address, tokenId)
    );
  }

  async function vandalize(contract1, tokenId1, contract2, tokenId2) {
    await wallet.send(
      cryptoVandals.methods.mint(
        wallet.address,
        contract1.options.address,
        tokenId1,
        contract2.options.address,
        tokenId2,
        "http://example.com"
      )
    );
    return await lastTokenId(cryptoVandals);
  }

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
  const tokenId1 = await mint();
  const tokenId2 = await mint();
  const tokenId3 = await mint();

  console.log("\nstart vandalization\n".rainbow.bold);

  await approve(vandalizeMe, tokenId1);
  await approve(vandalizeMe, tokenId2);
  await approve(vandalizeMe, tokenId3);

  const vandalizedTokenId1 = await vandalize(
    vandalizeMe,
    tokenId1,
    vandalizeMe,
    tokenId2
  );

  await approve(cryptoVandals, vandalizedTokenId1);
  const vandalizedTokenId2 = await vandalize(
    cryptoVandals,
    vandalizedTokenId1,
    vandalizeMe,
    tokenId3
  );

  const sources1 = await cryptoVandals.methods
    .sources(vandalizedTokenId1)
    .call();
  const sources2 = await cryptoVandals.methods
    .sources(vandalizedTokenId2)
    .call();

  console.log(
    `${c.red(vandalizedTokenId2)}@${cryptoVandals.options.address.green}`,
    "derives from",
    `\n  - ${c.red(sources2.tokenId1)}@${sources2.contract1.green}`,
    `\n  - ${c.red(sources2.tokenId2)}@${sources2.contract2.green}`
  );

  console.log();

  console.log(
    `${c.red(vandalizedTokenId1)}@${cryptoVandals.options.address.green}`,
    "derives from",
    `\n  - ${c.red(sources1.tokenId1)}@${sources1.contract1.green}`,
    `\n  - ${c.red(sources1.tokenId2)}@${sources1.contract2.green}`
  );
}

test();
