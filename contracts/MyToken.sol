// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.28;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals; // 1wei --> 1*10^-18 즉 지원하는 소수점 범위 

    uint256 public totalSupply; // 발행량
    mapping(address => uint256) public balanceOf; // 어떤 주소의 잔고(key => value)
    // 모든 address타입의 길이는 20byte로 고정되어 있다.
    // 위 mapping으로 balanceOf를 어떤 배열로 만들 수 있다.

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _amount) {
       name = _name;
       symbol = _symbol;
       decimals = _decimals; 
       _mint(_amount*10**uint256(decimals), msg.sender); // 컨트랙트 배포자에게 발행량을 부여한다.
    // 1 ether = 10^18 wei
    // 즉 컨트랙트를 배포하는 사람에게 1MT 만큼 발행량을 부여한다.  
    }

    function _mint(uint256 amount, address owner) internal {
        totalSupply += amount; 
        balanceOf[owner] += amount; // owner의 잔고에 amount를 더해준다.
    }

    function transfer(address to, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "insufficient balance"); // 송신자의 잔고가 amount보다 적으면 에러 발생
        balanceOf[msg.sender] -= amount; // 송신자로부터 amount를 차감한다.
        balanceOf[to] += amount; // 수신자에게 amount를 더해준다.
    }

//external: 외부에서만 호출 가능
//public: 외부와 내부에서 모두 호출 가능
//view: 상태변수를 읽기만 하고 수정하지 않겠다는 키워드
// returns -> 반환 여러개 가능
//     function totalSupply() external view returns(uint256) {
//         return totalSupply;
//     }
// }
//근데 왜 에러가 나는 걸까? -> 기본적으로 public으로 설정되어 있는 상태변수는 getter 함수가 자동으로 생성된다. 이 경우 totalSupply라는 변수가 public으로 설정되어있기 때문이다. 

// function balanceof(address owner) external view retruns (uint256) {
//     return balanceOf[owner];
// }
// 마찬가지로 balanceOf라는 변수가 public으로 설정되어있기 때문에 자동으로 getter 함수가 생성된다.

// function name() external view returns(string memory) {
//     return name;
// }
// 항상 주의할 점은 string을 쓸 때 memory를 붙여줘야 한다는 점이다.왜냐면 타입의 길이가 고정되어 있지 않기 때문이다.

}
// npx hardhat compile 하면 artifacts 폴더 아래 contracts/MyToken.sol/MyToken.json 에 이 컨트랙트 정보가 담겨있다. 
// 컴파일로 생선된 MyToken.json에서 이진코드(bytecode)를 확인할 수 있다. 