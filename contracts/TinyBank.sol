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
    function transfer(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external;
    function mint(uint256 amount, address owner) external;
} 
contract TinyBank {
    event Staked(address from, uint256 amount);
    event Withdrawn(address to, uint256 amount);

    IMyToken public stakingToken; // 예금/출금을 위한 토큰의 주소를 저장

    mapping(address => uint256) public lastClaimedBlock;
    uint256 rewardPerBlock = 1*10**18;

    mapping(address => uint256) public staked;
    uint256 public totalStaked;
     
    constructor(IMyToken _stakingToken) {
        stakingToken = IMyToken(_stakingToken);
    }

    function stake(uint256 _amount) external {
        require(_amount >=0, "cannot stake 0 amount");
        distributeReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "insufficient staked token");
        distributeReward(msg.sender);
        stakingToken.transfer(msg.sender, _amount);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;
        emit Withdrawn(msg.sender, _amount);
    }

    //Reward
    // - reward token : MyToken
    // - reward resources : 1 MT/block minting
    // - reward strategy : staked[user]/totalStaked distribution
    
    // - signer0 block 0 staking
    // - signer1 block 5 staking
    // - 0--1--2--3--4--5--
    //   |              |
    // - signer0 10MT   signer1 10MT

    function distributeReward(address to ) internal{
       uint256 blocks = block.number - lastClaimedBlock[to];
       uint256 reward = (blocks*rewardPerBlock*staked[to])/totalStaked;
       stakingToken.mint(reward, to);
       lastClaimedBlock[to] = block.number; 
    }
}