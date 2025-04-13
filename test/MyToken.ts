import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import MyToken from "../ignition/modules/MyToken";

const decimals = 18n;
const mintingAmount = 100n;
const totalSupply = mintingAmount * 10n ** decimals;

// 모카프레임워크를 사용하여 테스트를 진행
describe("MyToken", () => {
  let myTokenContract: MyToken;
  let signers: HardhatEthersSigner[];
  beforeEach("should deploy", async () => {
    myTokenContract = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      decimals,
      mintingAmount,
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
      expect(await myTokenContract.decimals()).to.equal(decimals);
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
          hre.ethers.parseUnits("0.5", decimals)
        )
      )
        .to.emit(myTokenContract, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.5", decimals)
        );
      expect(await myTokenContract.balanceOf(signer1.address)).equal(
        hre.ethers.parseUnits("0.5", decimals)
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
          hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimals)
        )
      ).to.be.revertedWith("insufficient balance");
    });
  });
});
//npx hardhat test
