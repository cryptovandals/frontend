var CryptoVandals = artifacts.require('./CryptoVandals.sol')

module.exports = function (deployer) {
  deployer.deploy(CryptoVandals)
}
