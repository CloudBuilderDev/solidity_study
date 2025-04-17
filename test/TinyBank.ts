import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank, IMyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

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
    tinyBankContract = await hre.ethers.deployContract("TinyBank", [
      myTokenContract.getAddress(),
    ]);
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
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenContract.approve(
        await tinyBankContract.getAddress(),
        stakingAmount
      );
      await tinyBankContract.stake(stakingAmount);
      await tinyBankContract.withdraw(stakingAmount);
      expect(await tinyBankContract.staked(signer0.address)).equal(0);
    });
  });
});
