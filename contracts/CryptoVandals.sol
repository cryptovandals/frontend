/**
 *    mmm                         m
 *  m"   "  m mm  m   m  mmmm   mm#mm   mmm
 *  #       #"  " "m m"  #" "#    #    #" "#
 *  #       #      #m#   #   #    #    #   #
 *   "mmm"  #      "#    ##m#"    "mm  "#m#"
 *                 m"    #
 *                ""     "
 *       m    m                   #         ""#
 *       "m  m"  mmm   m mm    mmm#   mmm     #     mmm
 *        #  #  "   #  #"  #  #" "#  "   #    #    #   "
 *        "mm"  m"""#  #   #  #   #  m"""#    #     """m
 *         ##   "mm"#  #   #  "#m##  "mm"#    "mm  "mmm"
 */



pragma solidity >=0.4.21 <0.6.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';


// We use OpenZeppelin ERC-721 as a baseline for our contract.
contract CryptoVandals is ERC721Full, ERC721Mintable {

  // Every new NFT token minted by this contract has one or two sources,
  // stored in the struct `Source`.
  struct Source {
    address contract1;
    uint256 tokenId1;
    address contract2;
    uint256 tokenId2;
  }

  //
  mapping(uint256 => Source) public sources;

  // Constructor to initialize the name and the symbol for this contract.
  constructor (string memory _name, string memory _symbol) public
    ERC721Full(_name, _symbol)
  {
  }

  function mint(
    address _owner,

    address _sourceContract1,
    uint256 _sourceTokenId1,

    address _sourceContract2,
    uint256 _sourceTokenId2,

    string calldata _newTokenURI
  ) external
  {
    //
    require(_sourceContract1.isContract());
    require(_sourceContract2 == address(0) || _sourceContract2.isContract());

    ERC721Full(_sourceContract1).transferFrom(
      _owner,
      address(1),
      _sourceTokenId1);

    if (_sourceContract2 != address(0)) {
      ERC721Full(_sourceContract2).transferFrom(
        _owner,
        address(1),
        _sourceTokenId2);
    }

    uint newTokenId = totalSupply();

    Source memory source = Source({
      contract1: _sourceContract1,
      tokenId1: _sourceTokenId1,
      contract2: _sourceContract2,
      tokenId2: _sourceTokenId2
    });

    sources[newTokenId] = source;

    super._mint(_owner, newTokenId);
    super._setTokenURI(newTokenId, _newTokenURI);
  }
}

// [1]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
