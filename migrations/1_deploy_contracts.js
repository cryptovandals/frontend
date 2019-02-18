// @format
var fs = require("fs");

var CryptoVandals = artifacts.require("./CryptoVandals.sol");
var VandalizeMe = artifacts.require("./VandalizeMe.sol");

module.exports = function(deployer, network) {
  deployer.deploy(CryptoVandals, "Crypto Vandals United", "CVU").then(() => {
    const json = {
      abi: CryptoVandals.abi,
      networks: CryptoVandals.networks
    };
    fs.writeFileSync(
      "./deployment/contracts/CryptoVandals.json",
      JSON.stringify(json, null, 2)
    );
  });
  deployer.deploy(VandalizeMe, "Vandalize Me", "VM").then(() => {
    const json = {
      abi: VandalizeMe.abi,
      networks: VandalizeMe.networks
    };
    fs.writeFileSync(
      "./deployment/contracts/VandalizeMe.json",
      JSON.stringify(json, null, 2)
    );
  });
};
