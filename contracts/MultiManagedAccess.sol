//SPDX-Licese-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract MultiManagedAccess {
    // uint constant MANAGER_NUMBERS = 5; // 컴파일 시점에 값이 고정되며 컴파일 된 바이트 코드 자체에 inlined되니 항상 선언과 동시에 초기화가 필요하다. 
    uint immutable BACKUP_MANAGER_NUMBERS; // 생성자에서 딱 한번 초기화 할 수 있다. 생성자를 통해 초기화된 시점에 값이 고정된다.  

    // 생성자의 인자로 받은 매니저 수에 따라 배열의 크기를 동적으로 할당하도록 구현 
    address[] public managers;
    bool[] public confirmed;
    address public owner;
    

    constructor(address _owner, address[] memory _managers, uint _manager_numbers) {
        require(_managers.length == _manager_numbers, "size unmatched");
        owner = _owner;
        BACKUP_MANAGER_NUMBERS = _manager_numbers;
        for(uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) { // soldity에서는 배열 주소를 사용한 얕은 복사를 지원하지 않는다. 
            managers.push(_managers[i]); 
        }
        confirmed = new bool[](BACKUP_MANAGER_NUMBERS);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized");
        _;
    }

    function allConfirmed() internal view returns (bool) {
        for(uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) {
            if(!confirmed[i]) {
                return false;
            }
        }
        return true;
    }
    function reset() internal {
        for(uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) {
           confirmed[i] = false; 
        }
    }

    modifier onlyAllConfirmed() {
        require(allConfirmed(), "Not all managers confirmed yet"); 
        reset();
        _;
    }

    function confirm() external {
        bool found = false;
        for(uint i = 0; i < BACKUP_MANAGER_NUMBERS; i++) {
            if(msg.sender == managers[i]) {
                found = true;
                confirmed[i] = true;
                break;
            }
        }
        require(found, "You are not one of the managers");
    }
}