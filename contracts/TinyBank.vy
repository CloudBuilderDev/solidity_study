# @version ^0.3.0
# @license MIT


interface IMyToken:
    def transfer(_amount: uint256, _to: address):nonpayable
    def transferFrom(_owner: address, _to: address, _amount: uint256):nonpayable
    def mint(_amount: uint256, _to: address):nonpayable
# interface name:
#     def name() -> type:nonpayable #call back function이 아니다, native token을 받을 수 없는 함수이다 라는 의미. 

INIT_REWARD: constant(uint256) = 1 * 10 ** 18 # 블럭당 하나의 MT토큰

event Staked:
    _owner:address
    _amount: indexed(uint256)

event Withdraw:
    _amount: uint256
    _to: indexed(address)

staked: public(HashMap[address, uint256])
totalStaked: public(uint256)

stakingToken:IMyToken 

rewardPerBlock: uint256
lastClaimedBlock: HashMap[address, uint256]
owner: address
manager : address

@external
def __init__(_stakingToken:IMyToken):
    self.stakingToken = _stakingToken
    self.rewardPerBlock = INIT_REWARD 
    self.owner = msg.sender
    self.manager = msg.sender

@internal
def onlyOwner(_owner: address):
    assert _owner == _owner, "You are not authorized"

@internal
def onlyManager(_manager: address):
    assert _manager == _manager, "You are not authorized to manage this contract"
    

@external
def setRewardPerBlock(_amount: uint256):
    self.onlyManager(msg.sender)
    self.rewardPerBlock = _amount
    
 
@internal
def updateReward(_to:address):
    if self.staked[_to] >0 :
        blocks: uint256 = block.number - self.lastClaimedBlock[_to]
        reward: uint256 = self.rewardPerBlock * blocks * self.staked[_to] / self.totalStaked
        self.stakingToken.mint(reward, _to)

    self.lastClaimedBlock[_to] = block.number   

@external
def stake(_amount: uint256):
    assert _amount > 0, "cannot stake 0 amount"
    self.updateReward(msg.sender)
    self.stakingToken.transferFrom(msg.sender, self, _amount)
    self.staked[msg.sender] += _amount
    self.totalStaked += _amount
    log Staked(msg.sender, _amount)

@external
def withdraw(_amount: uint256):
    assert self.staked[msg.sender] >= _amount, "insufficient staked token"
    self.updateReward(msg.sender)
    self.stakingToken.transfer(_amount, msg.sender)
    self.staked[msg.sender] -= _amount
    self.totalStaked -= _amount
    log Withdraw(_amount, msg.sender)

    
