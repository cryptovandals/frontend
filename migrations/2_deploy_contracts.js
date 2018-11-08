var fs = require('fs')

var CryptoVandals = artifacts.require('./CryptoVandals.sol')
var VandalizeMe = artifacts.require('./VandalizeMe.sol')

module.exports = function (deployer) {
  deployer.deploy(CryptoVandals, 'Crypto Vandals United', 'CVU').then(() => {
      const json = {
        'abi': CryptoVandals.abi,
        'address': CryptoVandals.address
      }
      fs.writeFileSync('./app/contracts/CryptoVandals.json', JSON.stringify(json, null, 2))
  })
  deployer.deploy(VandalizeMe, 'Vandalize Me', 'VM')
}
