import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import MyToken from "../ignition/modules/MyToken";
import { DECIMALS, MINTING_AMOUNT } from "./constant";

const totalSupply = MINTING_AMOUNT * 10n ** DECIMALS;

// 모카프레임워크를 사용하여 테스트를 진행
describe("MyToken", () => {
  let myTokenContract: MyToken;
  let signers: HardhatEthersSigner[];
  beforeEach("should deploy", async () => {
    myTokenContract = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);
    // 이를 통해 myTokenContract를 생성함
    // myTokenContract는 ethers.Contract의 인스턴스이다.
    signers = await hre.ethers.getSigners();
  });

  describe("basic state value check", () => {
    it("should retun name", async () => {
      expect(await myTokenContract.name()).to.equal("MyToken");
    });

    it("should retun symbol", async () => {
      expect(await myTokenContract.symbol()).to.equal("MT");
    });

    it("should retun decimals", async () => {
      expect(await myTokenContract.decimals()).to.equal(DECIMALS);
    });

    it("should return 100 totalSupply", async () => {
      expect(await myTokenContract.totalSupply()).equal(totalSupply);
    });
  });
  describe("minting", () => {
    it("should retrun 1MT balance for signer 0", async () => {
      expect(await myTokenContract.balanceOf(signers[0].address)).equal(
        totalSupply
      );
    });
    it("should return or revert when minitng infinitly", async () => {
      const hacker = signers[2];
      const mintingAmount = hre.ethers.parseUnits("10000", DECIMALS);
      const mintingAmount_form = hre.ethers.formatUnits(await hre.ethers.parseUnits("10000", DECIMALS)).toString() + "MT";
      // 이렇게 아무나 minting을 시도하면 안된다. 
      await expect(myTokenContract.connect(hacker).mint(mintingAmount, hacker.address)).to.be.revertedWith("You are not authorized to manage this contract");
      // TDD : Test Driven Development
      // 위 expect문을 통과할 수 있도록 코드를 수정하자.  
      // owner가 아닌 사람은 minting을 할 수 없도록, modifier를 mint함수에 추가한다. -> 정상적으로 위 revert문이 동작한다.  
    })
  });
  describe("transfer", () => {
    it("should return 0.5MT", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      //const tx = await myTokenContract.transfer(
      // signer0.address,
      //hre.ethers.parseUnits("0.5", decimals)
      //);
      //const receipt = await tx.wait();
      //console.log(receipt?.logs);
      //console.log(
      // "signer1 balance: ",
      // await myTokenContract.balanceOf(signer1.address)
      //);
      await expect(
        // await을 expect앞에 감싸줘야 의도한대로 작동한다.
        myTokenContract.transfer(
          signer1.address,
          hre.ethers.parseUnits("0.5", DECIMALS)
        )
      )
        .to.emit(myTokenContract, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.5", DECIMALS)
        );
      expect(await myTokenContract.balanceOf(signer1.address)).equal(
        hre.ethers.parseUnits("0.5", DECIMALS)
      );

      //const filter = myTokenContract.filters.Transfer(signer0.address); // 이 문장에서 에러가 발생한다. indexer가 없기 때문이다. 이를 .sol파일에서 이벤트 정의에서 추가해준다.
      //const logs = await myTokenContract.queryFilter(filter,0, "latest");
      //console.log(logs.length);

      //console.log(logs[0].args.from);
      //console.log(logs[0].args.to);
      //console.log(logs[0].args.value);
    });

    it("should be revert with insufficient balance error ", async () => {
      const signer1 = signers[1];
      await expect(
        myTokenContract.transfer(
          signer1.address,
          hre.ethers.parseUnits((MINTING_AMOUNT + 1n).toString(), DECIMALS)
        )
      ).to.be.revertedWith("insufficient balance");
    });
  });

  describe("Transfer From", () => {
    it("should emit Approval event", async () => {
      const signer1 = signers[1];
      await expect(
        myTokenContract.approve(
          signer1.address,
          hre.ethers.parseUnits("10", DECIMALS)
        )
      )
        .to.emit(myTokenContract, "Approval")
        .withArgs(signer1.address, hre.ethers.parseUnits("10", DECIMALS));
    });
    it("should be reverted with insufficient allowance error", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenContract
          .connect(signer1)
          .transferFrom(
            signer0.address,
            signer1.address,
            hre.ethers.parseUnits("10", DECIMALS)
          )
      ).to.be.revertedWith("insufficient allowance");
    });
    it("check transferFrom fucntion ", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await myTokenContract.approve(
        signer1.address,
        hre.ethers.parseUnits("100", DECIMALS)
      ); // signer1에게 singer0의 100MT 이동권을 승인
      await myTokenContract
        .connect(signer1)
        .transferFrom(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("10", DECIMALS)
        ); // singer1로 연결하고, signer1의 transferFrom을 호출하여 signer0의 10MT를 signer1에게 전송
      expect(await myTokenContract.balanceOf(signer1.address)).to.equal(
        hre.ethers.parseUnits("10", DECIMALS)
      ); // signer1의 잔고가 10MT인지 확인
      expect(await myTokenContract.balanceOf(signer0.address)).to.equal(
        hre.ethers.parseUnits("90", DECIMALS)
      ); // signer0의 잔고가 90MT인지 확인
    });
  });
});
//npx hardhat test
