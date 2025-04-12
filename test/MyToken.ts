import hre from "hardhat";
import {expect} from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// 모카프레임워크를 사용하여 테스트를 진행
describe("mytoken deploy", () => {
    let myTokenContract:MyToken;
    let signers: HardhatEthersSigner[]; 
    before("should deploy", async () => {
         myTokenContract = await hre.ethers.deployContract("MyToken",["MyToken", "MT", 18,]);
         // 이를 통해 myTokenContract를 생성함
         // myTokenContract는 ethers.Contract의 인스턴스이다.
         signers = await hre.ethers.getSigners();
    });

    it("should retun name", async () => {
        expect(await myTokenContract.name()).to.equal("MyToken");
    });

    it("should retun symbol", async () => {
        expect(await myTokenContract.symbol()).to.equal("MT");
    });

    it("should retun decimals", async () => {
        expect(await myTokenContract.decimals()).to.equal("18");
    });

    it("should return 0 totalSupply", async () => {
        expect(await myTokenContract.totalSupply()).equal(1n*10n**18n);
    });
    it("should retrun 1MT balance for signer 0", async () => {
        expect(await myTokenContract.balanceOf(signers[0].address)).equal(1n*10n**18n);
    });
    it("should return 0.5MT", async () => {
        const signer1 = signers[1];
        await myTokenContract.transfer(signer1.address, hre.ethers.parseUnits("0.5", 18));
        expect(await myTokenContract.balanceOf(signer1.address)).equal(hre.ethers.parseUnits("0.5", 18));
        console.log("signer1 balance: ", await myTokenContract.balanceOf(signer1.address));
    });

    it("should ", async () => {
        const signer1 = signers[1];
        await myTokenContract.transfer(signer1.address, hre.ethers.parseUnits("1.5", 18));
        //expect(await myTokenContract.balanceOf(signer1.address)).equal(hre.ethers.parseUnits("0.5", 18));
        //console.log("signer1 balance: ", await myTokenContract.balanceOf(signer1.address));
    });
});
//npx hardhat test