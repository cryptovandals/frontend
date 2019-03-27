const VandalizeMe = artifacts.require("VandalizeMe");
const CryptoVandals = artifacts.require("CryptoVandals");
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";
const BURN_ADDR = "0x0000000000000000000000000000000000000001";

contract("CryptoVandals", async accounts => {
  it("should vandalize one NFT", async () => {
    const [alice] = accounts;
    const vm = await VandalizeMe.deployed();
    const cv = await CryptoVandals.deployed();

    const txMint = await vm.mint(alice, "ipfs://hash-original", {
      from: alice
    });
    const txApprove = await vm.approve(cv.address, 0);
    const txVandalize = await cv.vandalize(
      vm.address,
      0,
      "ipfs://hash-vandalized"
    );

    // New owner in the original contract is set to 0x1.
    assert.equal(await vm.ownerOf.call(0), BURN_ADDR, "Owner didn't change.");

    // The new nft has a new tokenURI.
    assert.equal(
      await cv.tokenURI.call(0),
      "ipfs://hash-vandalized",
      "tokenURI didn't change."
    );

    // Check the source of the newly created nft
    const source = await cv.sources.call(0);
    assert.equal(source.contract1, vm.address);
    assert.equal(source.tokenId1, 0);
    assert.equal(source.contract2, ZERO_ADDR);
    assert.equal(source.tokenId2, 0);
  });

  it("should vandalize two NFTs", async () => {
    //
    // WARNING: truffle test doesn't redeploy the contracts, so we inherit the
    // state from the previous test.
    // If we mint a new token, the tokenId will be 1, not 0 as before.
    //

    const [alice] = accounts;
    const vm = await VandalizeMe.deployed();
    const cv = await CryptoVandals.deployed();

    const txMint = await vm.mint(alice, "ipfs://hash-original", {
      from: alice
    });
    const txApprove = await vm.approve(cv.address, 1);

    const txMint2 = await vm.mint(alice, "ipfs://hash-original2", {
      from: alice
    });
    const txApprove2 = await vm.approve(cv.address, 2);

    const txVandalize = await cv.vandalize2(
      vm.address,
      1,
      vm.address,
      2,
      "ipfs://hash-vandalized"
    );

    // New owner in the original contract is set to 0x1.
    assert.equal(await vm.ownerOf.call(1), BURN_ADDR, "Owner didn't change.");

    // The new nft has a new tokenURI.
    assert.equal(
      await cv.tokenURI.call(1),
      "ipfs://hash-vandalized",
      "tokenURI didn't change."
    );

    // Check the source of the newly created nft
    const source = await cv.sources.call(1);
    assert.equal(source.contract1, vm.address);
    assert.equal(source.tokenId1, 1);
    assert.equal(source.contract2, vm.address);
    assert.equal(source.tokenId2, 2);
  });
});
