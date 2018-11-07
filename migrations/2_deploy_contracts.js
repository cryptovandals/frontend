var CryptoVandals = artifacts.require('./Cryptovandals.sol')

module.exports = function (deployer) {
  deployer.deploy(CryptoVandals)
}
