pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract VandalizeMe is Ownable, ERC721Token {
  constructor (string _name, string _symbol) public
    ERC721Token(_name, _symbol)
  {
  }

  function mint(
    address _to,
    string  _tokenURI
  ) external
  {
    uint newTokenId = totalSupply();
    super._mint(_to, newTokenId);
    super._setTokenURI(newTokenId, _tokenURI);
  }
}
