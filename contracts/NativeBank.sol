// SKDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract NativeBank {
    mapping(address => uint256) public balanceOf;

    function withdraw() external {
        uint256 balance = balanceOf[msg.sender]; // 잔고를 한번에 가져오기
        require(balance > 0, "Insufficient balance");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "failed to send native token");

        balanceOf[msg.sender] = 0; // 잔고를 0으로 초기화
    }

    receive() external payable {
        balanceOf[msg.sender] += msg.value; 
    }
}