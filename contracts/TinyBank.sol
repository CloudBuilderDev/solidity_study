// staking 
// Mytoken을 deposit / withdraw (예금/ 출금) 

// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw vault(금고 = tiny bank의 핵심 기능)
// - users token management
// - user --> deposit --> TinyBank --> transfer(user --> TinyBank)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// TinyBank와 MyToken간의 통신을 위한 인터페이스 
interface IMyToken {
    function transefer(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external;
} 
contract TinyBank {
    event Staked(address, uint256);

    IMyToken public stakingToken; // 예금/출금을 위한 토큰의 주소를 저장
    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor(IMyToken _stakingToken) {
        stakingToken = IMyToken(_stakingToken);
    }

    function stake(uint256 _amount) external {
        require(_amount >=0, "cannot stake 0 amount");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }
}