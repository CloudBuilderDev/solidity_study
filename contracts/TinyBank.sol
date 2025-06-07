// staking 
// Mytoken을 deposit / withdraw (예금/ 출금) 

// MyToken : token balance management
// - the balance of TinyBank address
// TinyBank : deposit / withdraw vault(금고 = tiny bank의 핵심 기능)
// - users token management
// - user --> deposit --> TinyBank --> transfer(user --> TinyBank)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./ManagedAccess.sol";
import "./ManagedAccess.sol";

// TinyBank와 MyToken간의 통신을 위한 인터페이스 
interface IMyToken  {
    function transfer(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external;
    function mint(uint256 amount, address owner) external;
} 
contract TinyBank is ManagedAccess {
    event Staked(address from, uint256 amount);
    event Withdrawn(address to, uint256 amount);

    IMyToken public stakingToken; // 예금/출금을 위한 토큰의 주소를 저장

    mapping(address => uint256) public lastClaimedBlock;
    uint256 DefaultRewardPerBlock = 1*10**18;
    uint256 rewardPerBlock;

    function getRewardPerBlock() external view returns (uint256) {
        return rewardPerBlock;
    }
        

    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    // MultiMangedAccess의 생성자 인자를 다음과 같이 전달한다.
    // constructor(IMyToken _stakingToken, address[] memory _managers, uint256 _ManagerNumber) ManagedAccess(msg.sender, _managers, _ManagerNumber) {
    //     stakingToken = IMyToken(_stakingToken);
    //     rewardPerBlock = DefaultRewardPerBlock;
    // }
    constructor(IMyToken _stakingToken, address _manager ) ManagedAccess(msg.sender, _manager) {
        stakingToken = IMyToken(_stakingToken);
        rewardPerBlock = DefaultRewardPerBlock;
    }

    // modifier를 onlyAllConfirmed로 설정하여, 모든 매니저가 확인을 해야만 실행되도록 한다.
    // function setRewardPerBlock(uint256 _amount) external onlyAllConfirmed{
    //     rewardPerBlock = _amount;
    // }

    function stake(uint256 _amount) external UpdateReward(msg.sender) {
        require(_amount >=0, "cannot stake 0 amount");
        // UpdateReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        staked[msg.sender] += _amount;
        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external UpdateReward(msg.sender) {
        require(staked[msg.sender] >= _amount, "insufficient staked token");
        // UpdateReward(msg.sender);
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


// midifier는 기본적으로 internal임, 외부에서 호출할 수 없음
// modifier는 함수가 아니기에 함수처럼 호출 할 수 없다. 
// _;가 앞에 붙어있으면, modifier가 적용된 함수가 실행되기 전에 modifier가 실행된다.
// _;가 뒤에 붙어있으면, modifier가 적용된 함수가 실행된 후에 modifier가 실행된다.
    modifier UpdateReward(address to ) {
        if(staked[to] > 0) {
       uint256 blocks = block.number - lastClaimedBlock[to];
       uint256 reward = (blocks*rewardPerBlock*staked[to])/totalStaked;
       stakingToken.mint(reward, to);
        }
       lastClaimedBlock[to] = block.number; 
       _;
    }
}