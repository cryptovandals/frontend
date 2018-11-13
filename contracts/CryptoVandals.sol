pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract CryptoVandals is Ownable, ERC721Token {

  struct Remix {
    address contract1;
    uint256 tokenId1;
    address contract2;
    uint256 tokenId2;
  }

  mapping(uint256 => Remix) public remixes;

  constructor (string _name, string _symbol) public
    ERC721Token(_name, _symbol)
  {
  }

  function mint(
    address _owner,

    address _sourceContract1,
    uint256 _sourceTokenId1,

    address _sourceContract2,
    uint256 _sourceTokenId2,

    string  _newTokenURI
  ) external
  {
    require(_sourceContract1.isContract());
    require(_sourceContract2 == address(0) || _sourceContract2.isContract());

    ERC721Basic(_sourceContract1).transferFrom(_owner, address(1), _sourceTokenId1);

    if (_sourceContract2 != address(0)) {
      ERC721Basic(_sourceContract2).transferFrom(_owner, address(1), _sourceTokenId2);
    }

    uint newTokenId = totalSupply().add(1);

    Remix memory remix = Remix({
      contract1: _sourceContract1,
      tokenId1: _sourceTokenId1,
      contract2: _sourceContract2,
      tokenId2: _sourceTokenId2
    });

    remixes[newTokenId] = remix;

    super._mint(_owner, newTokenId);
    super._setTokenURI(newTokenId, _newTokenURI);
  }
}
