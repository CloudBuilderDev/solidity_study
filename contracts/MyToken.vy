# @version ^0.3.0
# @license MIT   

#Vyper는 이 파일 자체가 컨트랙트이다. 

event Transfer:
    owner: indexed(address)
    to : indexed(address)
    amount : uint256

event Approval:
    spender : indexed(address)
    amount : uint256


# 마찬 가지로, 다음 변수들에 대한 getter function이 자동으로 생성된다. 
# 컴파일한 결과를 artifacts에서 MyToken.json을 통해 확인할 수 있는데, 각 변수들에 대한 view function이 생성되었음을 확인할 수 있다. 
name: public(String[64]) 
symbol: public(String[32])
decimals: public(uint256)
totalSupply: public(uint256)

balanceOf: public(HashMap[address, uint256])
allowances: public(HashMap[address, HashMap[address, uint256]])

owner : address
manager : address

# internal 함수 내부에서는 msg.sender를 접근할 수 없다.  
@internal
def onlyOwner(_owner: address):
    assert self.owner == _owner , "You are not authorized"

@internal
def onlyManager(_manager: address):
    assert self.manager == _manager, "You are not authorized to manage this contract" 



@external
def __init__(_name: String[64], _symbol: String[32], _decimals: uint256, _initialSupply: uint256):
    self.name = _name
    self.symbol = _symbol
    self.decimals = _decimals
    self.totalSupply = _initialSupply * 10 ** 18
    self.balanceOf[msg.sender] += _initialSupply * 10 ** 18
    self.owner = msg.sender
    self.manager = msg.sender  

@external
def transfer(_amount:uint256, _to:address):
    assert self.balanceOf[msg.sender] >= _amount, "insufficient balance"
    self.balanceOf[msg.sender] -= _amount
    self.balanceOf[_to] += _amount

    log Transfer(msg.sender, _to, _amount)

@external
def approve(_spender:address, _amount:uint256):
    # assert self.balanceOf[_owner] >= _amount, "insufficient balance"
    self.allowances[msg.sender][_spender] += _amount
    
    log Approval(_spender, _amount)
    
@external
def transferFrom(_owner:address, _to:address, _amount:uint256):
    assert self.allowances[_owner][msg.sender] >= _amount, "insufficient allowance"
    assert self.balanceOf[_owner] >= _amount, "insufficient balance"
    self.balanceOf[_owner] -= _amount
    self.balanceOf[_to] += _amount
    self.allowances[_owner][msg.sender] -= _amount
    
    log Transfer(_owner, _to, _amount)
    
@internal
def _mint(_amount:uint256, _to:address):
    self.balanceOf[_to] += _amount
    self.totalSupply += _amount
    
    log Transfer(ZERO_ADDRESS, _to, _amount)

@external
def mint(_amount:uint256, _to:address):
    self.onlyManager(msg.sender)
    self._mint(_amount, _to)

@external
def setManager(_manager: address):
    self.onlyOwner(msg.sender)
    self.manager = _manager
    
