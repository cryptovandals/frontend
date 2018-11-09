pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract VandalizeMe is Ownable, ERC721Token {
  string[] public works;

  constructor (string _name, string _symbol) public
    ERC721Token(_name, _symbol)
  {
  }

  function mint(
    address _to,
    string  _tokenURI
  ) external
  {
    uint workId = works.push(_tokenURI) - 1;
    super._mint(_to, workId);
    super._setTokenURI(workId, _tokenURI);
  }
}
