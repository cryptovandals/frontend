pragma solidity ^0.4.24;

contract ITransferContract {
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
}
