var fs = require('fs')

var CryptoVandals = artifacts.require('./CryptoVandals.sol')
var VandalizeMe = artifacts.require('./VandalizeMe.sol')

module.exports = function (deployer) {
  deployer.deploy(CryptoVandals, 'Crypto Vandals United', 'CVU')
  deployer.deploy(VandalizeMe, 'Vandalize Me', 'VM')
}
