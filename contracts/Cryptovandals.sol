pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./ICryptoKitties.sol";

contract Cryptovandals is Ownable, ERC721Token {
  string[] public works;
  CryptoKitties cryptoKitties;

  constructor (string _name, string _symbol) public
    ERC721Token(_name, _symbol)
  {
  }

  function setCryptoKittiesAddress(address _address) external onlyOwner {
    cryptoKitties = CryptoKitties(_address);
  }

  function mint(
    address _to,
    string  _tokenURI,
    uint256 _tokenId
  ) external
  {
    cryptoKitties.transferFrom(address(this), address(1), _tokenId);
    uint workId = works.push(_tokenURI) - 1;
    super._mint(_to, workId);
    super._setTokenURI(workId, _tokenURI);
  }
}
