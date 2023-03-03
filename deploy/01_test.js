const { Wallet, utils, ContractFactory } = require("zksync-web3");
const ethers = require("ethers");
const { HardhatRuntimeEnvironment } = require("hardhat/types");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const { PrivateKey } = require("../scripts/Utils");

const artifacts = {
    // SwapRouterAddress 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    UniswapV3Factory: require("../ABI/UniswapV3Factory.sol/UniswapV3Factory.json"),
    // SwapRouter: require("../ABI/SwapRouter.sol/SwapRouter.json"),
    // NFTDescriptor: require("../ABI/NFTDescriptor.sol/NFTDescriptor.json"),
    // NonfungibleTokenPositionDescriptor: require("../ABI/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
    // NonfungiblePositionManager: require("../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    // Quoter: require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'),
    // QuoterV2: require('../ABI/QuoterV2.sol/QuoterV2.json'),
    // // WETH9,
    // tokenCheck: require('../artifacts/contracts/TokenChecker.sol/tokenCheck.json')
};

module.exports = async function (hre) {
        
    console.log(`Running deploy script for the Greeter contract`);
    const wallet = new Wallet(`0x${PrivateKey}`);

    const deployer = new Deployer(hre, wallet);

    const artifact = await deployer.loadArtifact("Tether");

    // let Factory = new ContractFactory(artifacts.UniswapV3Factory.abi, artifacts.UniswapV3Factory.bytecode, );
    // let factory = await Factory.deploy();

    // Estimate contract deployment fee
    const greeting = "Hi there!";
    const deploymentFee = await deployer.estimateDeployFee(artifact, []);

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
    const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
    console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

    // const greeterContract = await deployer.deploy(artifact, []);

    // //obtain the Constructor Arguments
    // console.log("constructor args:" + greeterContract.interface.encodeDeploy([]));

    // // Show the contract info.
    // const contractAddress = greeterContract.address;
    // console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
    // console.log(`factory was deployed to ${factory.address}`);
}