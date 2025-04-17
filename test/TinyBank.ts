import hre from "hardhat";
import { expect } from "chai";

describe("TinyBank", () => {
  beforeEach(() => {
    myTokenContract = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      decimals,
      mintingAmount,
    ]);
  });
});
