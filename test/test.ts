import hre from "hardhat";
import {ethers} from "ethers"

describe("hardhat-test",()=> {
    // 이 경우, 따로 hardhat 네트워크를 열어둘 필요 없이 이 테스트에 한하여
    // 테스트에 필요한 네트워크를 열어 사용한다. 
    it("print-hardhat", async () => {
        const signers = await hre.ethers.getSigners();
        // bob -> alice : 100 ETH
        const bobWallet = signers[0];
        const aliceWallet = signers[1];
        const tx = {
            from: bobWallet.address,
            to: aliceWallet.address,
            // 1 ETH == 1 wei == 10^18
            // 100 ETH == 100 * wei == 100 * 10^18
            value: hre.ethers.parseEther("100"), // parse는 wei단위
        };
        // sendTransaction은 서명과정을 내부적으로 포함한다. 
        // 심지어 어디로 보낼지도 알아서 한다. 
        const txHash = await bobWallet.sendTransaction(tx);
        const receipt = txHash.wait();
        // console.log(await hre.ethers.provider.getTransaction(txHash.hash));
        // console.log("---------------------");
        // console.log(receipt)
    });

    // 이 경우, hardhat이 아닌 ethers로 트랜잭션 하는 경우이다. 
    // hardhat 가상의 eth네트워크를 실행 시켜두고 해당 포트에 연결해서 
    // 트랜잭션을 수행해야 한다. 
    it("ethers test", async () =>{
        const provider = new ethers.JsonRpcProvider("http://localhost:8545");
        const BobWallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
        const AliceWallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
        const tx = {
            from: BobWallet.address,
            to: AliceWallet.address,
            value: ethers.parseEther("100"),
            // chainID: 31337, populateTransaction을 하면 알아서 넣어준다.
        };
        // transaction 객체에는 사실 채워줘야할 필드가 굉장히 많다. 
        // sendTransaction()에서는 알아서 해준다. 
        // 아래와 같이 populateTransaction으로 필드를 채우자 
        const populatedTx = await BobWallet.populateTransaction(tx);
        // console.log(populatedTx); // 자동으로 tx를 채웠다. 
        const signedTX = await BobWallet.signTransaction(populatedTx);
        const txHash = await provider.send("eth_sendRawTransaction", [signedTX]);
        // console.log(txHash);
        console.log(ethers.formatEther(await provider.getBalance(BobWallet.address)));
        console.log(ethers.formatEther(await provider.getBalance(AliceWallet.address)));
    });
});