const { Wallet, utils, ContractFactory } = require("zksync-web3");
const ethers = require("ethers");
const { HardhatRuntimeEnvironment } = require("hardhat/types");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");

const artifacts = {
    UniswapV3Factory_zk: require("../ABI-zk/UniswapV3Factory.sol/UniswapV3Factory.json"),
    SwapRouter_zk: require("../ABI-zk/SwapRouter.sol/SwapRouter.json"),
    NFTDescriptor_zk: require("../ABI-zk/NFTDescriptor.sol/NFTDescriptor.json"),
    // NonfungibleTokenPositionDescriptor: require("../ABI/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
    // NonfungiblePositionManager: require("../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    // Quoter: require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'),
    // QuoterV2: require('../ABI/QuoterV2.sol/QuoterV2.json'),
    WETH9_zk: require('../ABI-zk/WETH9.sol/WETH9.json'),
    // tokenCheck: require('../artifacts/contracts/TokenChecker.sol/tokenCheck.json')
};

// An example of a deploy script that will deploy and call a simple contract.
module.exports = async function (hre) {
    return
    console.log(`Running deploy script for the Greeter contract`);
    // Initialize the wallet.
    const wallet = new Wallet("0xadf787d3490ae2a37e70df7fc654be598cd91d6f2932f68bc62c99b2e88bb376");

    const provider = new ethers.providers.JsonRpcProvider("");
    // Create deployer object and load the artifact of the contract you want to deploy.
    const deployer = new Deployer(hre, wallet);

    // let TokenChecker = await deployer.loadArtifact("tokenCheck");
    // let tokenchecker = await deployer.deploy(TokenChecker, []);

    let Weth = new ContractFactory(artifacts.WETH9_zk.abi, artifacts.WETH9_zk.bytecode, deployer.zkWallet);
    let weth = await Weth.deploy();

    let Factory = new ContractFactory(artifacts.UniswapV3Factory_zk.abi, artifacts.UniswapV3Factory_zk.bytecode, deployer.zkWallet);
    let factory = await Factory.deploy();

    let SwapRouter = new ContractFactory(artifacts.SwapRouter_zk.abi, artifacts.SwapRouter_zk.bytecode, deployer.zkWallet);
    let swapRouter = await SwapRouter.deploy(factory.address, weth.address);

    // let NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor_zk.abi, artifacts.NFTDescriptor_zk.bytecode, deployer.zkWallet);
    // let nftDescriptor = await NFTDescriptor.deploy();

    // Estimate contract deployment fee
    // const greeting = "Hi there!";
    // const deploymentFee = await deployer.estimateDeployFee(artifact, []);

    // OPTIONAL: Deposit funds to L2
    // Comment this block if you already have funds on zkSync.
    // const depositHandle = await deployer.zkWallet.deposit({
    //     to: deployer.zkWallet.address,
    //     token: utils.ETH_ADDRESS,
    //     amount: deploymentFee.mul(2),
    // });
    // // Wait until the deposit is processed on zkSync
    // await depositHandle.wait();

    // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
    // `greeting` is an argument for contract constructor.
    // const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
    // console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

    // const greeterContract = await deployer.deploy(artifact, []);

    // //obtain the Constructor Arguments
    // console.log("constructor args:" + greeterContract.interface.encodeDeploy([]));

    // // Show the contract info.
    // const contractAddress = greeterContract.address;
    // console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
    console.log(`weth was deployed to ${weth.address}`);
    console.log(`factory was deployed to ${factory.address}`);
    console.log(`swapRouter was deployed to ${swapRouter.address}`);
    // console.log(`tokenchecker was deployed to ${tokenchecker.address}`);
    // console.log(`nftDescriptor was deployed to ${nftDescriptor.address}`);
}
