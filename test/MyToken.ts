import hre from "hardhat";
import {expect} from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

// 모카프레임워크를 사용하여 테스트를 진행
describe("mytoken deploy", () => {
    let myTokenContract:MyToken; // type을 모른다는 에러를 내지만, 이는 typescript라 그럼 시행은 문제 없음
    // 거슬리니 타입을 :MyToken이런식으로 명시 
    // before는 이 테스트케이스를 시행하기전 한번 시행하라는 의미
    let signers: HardhatEthersSigner[]; // signer의 타입을 명시
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
});
//npx hardhat test