pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./ITransferContract.sol";

contract Cryptovandals is Ownable, ERC721Token {
  string[] public works;

  constructor (string _name, string _symbol) public
    ERC721Token(_name, _symbol)
  {
  }

  function mint(
    address _source,
    address _to,
    string  _tokenURI,
    uint256 _tokenId
  ) external
  {
    ITransferContract sourceContract = ITransferContract(_source);
    sourceContract.transferFrom(address(this), address(1), _tokenId);
    uint workId = works.push(_tokenURI) - 1;
    super._mint(_to, workId);
    super._setTokenURI(workId, _tokenURI);
  }
}
