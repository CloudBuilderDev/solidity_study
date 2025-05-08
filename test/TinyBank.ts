import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank, IMyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BigNumberish, Block } from "ethers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let myTokenContract: MyToken;
  let tinyBankContract: TinyBank;
  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    myTokenContract = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);

    // signer0 ~ 4까지의 주소를 manager로 설정한다.
    const managersAdress = signers.slice(0,5).map(signer => signer.address);

    // tinyBankContract를 생성할 때, 인자로 매니저들의 주소와 그 명수를 넘겨준다. 
    tinyBankContract = await hre.ethers.deployContract("TinyBank", [
      myTokenContract.getAddress(),
      managersAdress,
      managersAdress.length,
    ]);

    await myTokenContract.setManager(tinyBankContract.getAddress());
  });
  describe("Initialized state check", () => {
    it("should return totalStaked 0", async () => {
      expect(await tinyBankContract.totalStaked()).equal(0);
    });
    it("should return staked 0 amount of signer0", async () => {
      const signer0 = signers[0];
      expect(await tinyBankContract.staked(signer0.address)).equal(0);
    });
  });
  describe("Staking", async () => {
    it("should return staked amount", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenContract.approve(
        await tinyBankContract.getAddress(),
        stakingAmount
      );
      await tinyBankContract.stake(stakingAmount);
      expect(await tinyBankContract.staked(signer0.address)).equal(
        stakingAmount
      );
      expect(await myTokenContract.balanceOf(tinyBankContract)).equal(
        await tinyBankContract.totalStaked()
      );
      expect(await tinyBankContract.totalStaked()).equal(stakingAmount);
    });
  });
  describe("Withdraw", () => {
    it("should return 0 staked after withdrawing total token", async () => {
      const signer0 = signers[0];
      const stakingAmount = amount(50);
      // const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenContract.approve(
        await tinyBankContract.getAddress(),
        stakingAmount
      );
      await tinyBankContract.stake(stakingAmount);
      await tinyBankContract.withdraw(stakingAmount);
      expect(await tinyBankContract.staked(signer0.address)).equal(0);
    });
  });
  describe("Reward", () => {
    it("should reward 1MT every blocks", async() => {
      const signer0 = signers[0];
      const stakingAmount = amount(50);
      // console.log("signer0 amount when contract initialized", await myTokenContract.balanceOf(signer0.address));
      // console.log("block number when contract initialized", await getBlockNumber());
      await myTokenContract.approve(await tinyBankContract.getAddress(), stakingAmount);
      await tinyBankContract.stake(stakingAmount);
      // console.log("signer0 amount when stake 50MT", await myTokenContract.balanceOf(signer0.address));
      
      const BLOCKS = 5n;
      const transferAmount = amount(1);
      for (var i = 0; i< BLOCKS; i++) {
        await myTokenContract.transfer(signer0.address, transferAmount);
      }
      // console.log("block number when transfer 5MT", await getBlockNumber());

      await tinyBankContract.withdraw(stakingAmount);
      // console.log("signer0 amount when withdraw 50MT", await myTokenContract.balanceOf(signer0.address));
      expect(await myTokenContract.balanceOf(signer0.address)).equal(amount(BLOCKS + MINTING_AMOUNT + 1n));
    })

    // -------------------------Assginement : test MultiManagedAccess--------------------------------------

    it("should revert when changing rewardPerBlock by hacker", async () => {
      const hacker = signers[1];
      const rewardToChange = amount(10000);
      // 이제 여러명의 매니저의 승인 없이는 setRewardPerBlock을 호출할 수 없기에 아래 코드의 revert문구가 바뀌어야 한다. 
      // await expect (tinyBankContract.connect(hacker).setRewardPerBlock(rewardToChange)).to.be.revertedWith("You are not authorized to manage this contract"); 
      await expect( tinyBankContract.connect(hacker).setRewardPerBlock(rewardToChange)).to.be.revertedWith("Not all managers confirmed yet");
    })
    // 매니저가 아닌 사람이 confirm을 시도하면 revert가 발생해야 한다.
    it("should revert when not manager try confirm", async () => {
      const hacker = signers[5];
      await expect( tinyBankContract.connect(hacker).confirm()).to.be.revertedWith("You are not one of the managers");
    });

    // 모든 매니저가 confirm을 하고 나면, rewardPerBlock을 변경할 수 있어야 한다.
    it("should change rewardPerBlock when all managers confirm", async () => {
      const rewardToChange = amount(10000);
      //console.log("기존 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
      // 모든 매니저가 confirm 
      for (let i = 0; i < 5; i++) {
        await tinyBankContract.connect(signers[i]).confirm();
      }
      await tinyBankContract.setRewardPerBlock(rewardToChange);
      //console.log("변경된 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
      expect(await tinyBankContract.getRewardPerBlock()).equal(rewardToChange);
    });

    // 만약, 매너저들 중 한명이라도 confirm을 하지 않으면, rewardPerBlock을 변경할 수 없다.
    it("should revert when not all managers confirm", async () => {
      const rewardToChange = amount(10000);
      //console.log("기존 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
      // 모든 매니저가 confirm 하지 않음 
      for (let i = 0; i < 4; i++) {
        await tinyBankContract.connect(signers[i]).confirm();
      }
      await expect(tinyBankContract.setRewardPerBlock(rewardToChange)).to.be.revertedWith("Not all managers confirmed yet");
      //console.log("변경된 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
    });

    // 한번 confirm을 소모한 이후에는 중복으로 승인할 수 없어야 한다. 
    it("should revert when already confirmed", async () => {
      const rewardToChange = amount(10000);
      //console.log("기존 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
      // 모든 매니저가 confirm 
      for (let i = 0; i < 5; i++) {
        await tinyBankContract.connect(signers[i]).confirm();
      }
      await tinyBankContract.setRewardPerBlock(rewardToChange);
      //console.log("변경된 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
      //다시 setRewardPerBlock을 시도하면 revert가 발생해야 한다.
      await expect(tinyBankContract.setRewardPerBlock(amount(20000))).to.be.revertedWith("Not all managers confirmed yet");
      //console.log("변경된 rewardPerBlock", hre.ethers.formatUnits(await tinyBankContract.getRewardPerBlock()));
    });

  });
});

// uitl fucntions 
function amount(_amount: BigNumberish) {
  return hre.ethers.parseUnits(_amount.toString(), DECIMALS);
}

function getBlockNumber() {
  return hre.ethers.provider.getBlockNumber();
}