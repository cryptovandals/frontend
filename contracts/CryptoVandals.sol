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

// # Welcome to the CryptoVandals Smart Contract
//
// **Warning: Using this contract will destroy your NFT (and generate a new
// one). Don't use it if you don't know what you are doing.**
//
// The logic of the contract is quite simple. The contract exposes two
// user friendly functions:
// - `vandalize(address _contract, uint256 _tokenId, string _newTokenURI)`;
// - ```vandalize2(
//  address _contract1,
//  uint256 _tokenId1,
//  address _contract2,
//  uint256 _tokenId2,
//  string _newTokenURI)```;
//
// `vandalize` calls the `transferFrom` function (defined in the ERC721
// standard) to *burn* the original NFT. Burning the NFT means to transfer it
// from its original owner to the address `0x1` in the original contract.
// After a successful transfer, the CryptoVandals contract mints a new NFT
// (adding the metadata pointed by `_newTokenURI`) and assigns it to
// `msg.sender`. A new record in the `sources` is then added. The record
// contains the provenance of the NFT: the original contract address and token
// ID.
//
// `vandalize2` works the same as `vandalize`, but allows to vandalize two NFTs
// into a single, vandalized one. Use this function if you want to do something
// fancy, like adding an audio track to a crypto kitty.
//
// You can also vandalize again your vandalized NFTs. In that case the old NFT
// is burnt, and a new one is minted. The `sources` is updated as well,
// creating a list (or tree, if you use `vandalize2`) of parent NFTs.
//
// Important: before calling any vandalize function, you **must** call
// `approve(address to, uint256 tokenId)` in the contract where your NFT is
// currently stored. If you don't do that, CryptoVandals won't be able to burn
// your NFT to generate a new one.


pragma solidity >=0.4.21 <0.6.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol';


// We use OpenZeppelin ERC-721 as a baseline for our contract.
contract CryptoVandals is ERC721Full, ERC721Mintable, ERC721Burnable {

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

    address _contract1,
    uint256 _tokenId1,

    address _contract2,
    uint256 _tokenId2,

    string memory _newTokenURI
  ) public
  {
    //
    require(_contract1.isContract());
    require(_contract2 == address(0) || _contract2.isContract());

    ERC721Full(_contract1).transferFrom(
      _owner,
      address(1),
      _tokenId1);

    if (_contract2 != address(0)) {
      ERC721Full(_contract2).transferFrom(
        _owner,
        address(1),
        _tokenId2);
    }

    uint newTokenId = totalSupply();

    Source memory source = Source({
      contract1: _contract1,
      tokenId1: _tokenId1,
      contract2: _contract2,
      tokenId2: _tokenId2
    });

    sources[newTokenId] = source;

    super._mint(_owner, newTokenId);
    super._setTokenURI(newTokenId, _newTokenURI);
  }

  function vandalize(
    address _contract,
    uint256 _tokenId,
    string calldata _newTokenURI
  ) external {
    mint(msg.sender, _contract, _tokenId, address(0), 0, _newTokenURI);
  }

  function vandalize2(
    address _contract1,
    uint256 _tokenId1,
    address _contract2,
    uint256 _tokenId2,
    string calldata _newTokenURI
  ) external {
    mint(msg.sender, _contract1, _tokenId1, _contract2, _tokenId2, _newTokenURI);
  }
}

// [1]: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
