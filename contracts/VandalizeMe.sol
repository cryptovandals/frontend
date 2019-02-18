pragma solidity >=0.4.21 <0.6.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract VandalizeMe is ERC721Full, ERC721Mintable {
  constructor (string memory _name, string memory _symbol) public
    ERC721Full(_name, _symbol)
  {
  }

  function mint(
    address _to,
    string calldata _tokenURI
  ) external
  {
    uint newTokenId = totalSupply();
    super._mint(_to, newTokenId);
    super._setTokenURI(newTokenId, _tokenURI);
  }
}
