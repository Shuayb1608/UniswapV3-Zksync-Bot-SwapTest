const { Wallet, utils, ContractFactory } = require("zksync-web3");
const ethers = require("ethers");
const { HardhatRuntimeEnvironment } = require("hardhat/types");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const { PrivateKey } = require("../scripts/Utils");
const { formatBytes32String } = require("ethers/lib/utils");

const artifacts = {
    UniswapV3Factory_zk: require("../ABI-zk/UniswapV3Factory.sol/UniswapV3Factory.json"),
    SwapRouter_zk: require("../ABI-zk/SwapRouter.sol/SwapRouter.json"),
    NFTDescriptor_zk: require("../ABI-zk/NFTDescriptor.sol/NFTDescriptor.json"),
    NonfungibleTokenPositionDescriptor_zk: require("../ABI-zk/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
    NonfungiblePositionManager_zk: require("../ABI-zk/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    Quoter_zk: require('../ABI-zk/Quoter.sol/Quoter.json'),
    QuoterV2_zk: require('../ABI-zk/QuoterV2.sol/QuoterV2.json'),
    WETH9_zk: require('../ABI-zk/WETH9.sol/WETH9.json'),
    tokenCheck_zk: require('../artifacts-zk/contracts/TokenChecker.sol/tokenCheck.json')
};


module.exports = async function (hre) {

    console.log(`Running deploy script for the Greeter contract`);
    const wallet = new Wallet(`${PrivateKey}`);
    const deployer = new Deployer(hre, wallet);

    let Weth = new ContractFactory(artifacts.WETH9_zk.abi, artifacts.WETH9_zk.bytecode, deployer.zkWallet);
    let weth = await Weth.deploy();

    let Factory = new ContractFactory(artifacts.UniswapV3Factory_zk.abi, artifacts.UniswapV3Factory_zk.bytecode, deployer.zkWallet);
    let factory = await Factory.deploy();

    let SwapRouter = new ContractFactory(artifacts.SwapRouter_zk.abi, artifacts.SwapRouter_zk.bytecode, deployer.zkWallet);
    let swapRouter = await SwapRouter.deploy(factory.address, weth.address);

    let NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor_zk.abi, artifacts.NFTDescriptor_zk.bytecode, deployer.zkWallet);
    let nftDescriptor = await NFTDescriptor.deploy();


    let Quarter = new ContractFactory(artifacts.Quoter_zk.abi, artifacts.Quoter_zk.bytecode, deployer.zkWallet);
    let quarter = await Quarter.deploy(factory.address, weth.address);

    let QuarterV2 = new ContractFactory(artifacts.QuoterV2_zk.abi, artifacts.QuoterV2_zk.bytecode, deployer.zkWallet);
    let quarterV2 = await QuarterV2.deploy(factory.address, weth.address);

    let TokenChecker = new ContractFactory(artifacts.tokenCheck_zk.abi, artifacts.tokenCheck_zk.bytecode, deployer.zkWallet);
    let tokencheck = await TokenChecker.deploy();

    const _nativeCurrencyLabelBytes = formatBytes32String("ETH");

    let NonfungibleTokenPositionDescriptor = new ContractFactory(artifacts.NonfungibleTokenPositionDescriptor_zk.abi, artifacts.NonfungibleTokenPositionDescriptor_zk.bytecode, deployer.zkWallet);
    let nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(weth.address, _nativeCurrencyLabelBytes);

    console.log('------------------------- Done -------------------------');


    //let NonfungiblePositionManager = new ContractFactory(artifacts.NonfungiblePositionManager_zk.abi, artifacts.NonfungiblePositionManager_zk.bytecode, deployer.zkWallet);
    //let nonfungiblePositionManager = await NonfungiblePositionManager.deploy(factory.address, weth.address, nonfungibleTokenPositionDescriptor.address);

    // const contractAddress = greeterContract.address;
    // console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
    // console.log(`weth was deployed to ${weth.address}`);
    // console.log(`factory was deployed to ${factory.address}`);
    // console.log(`swapRouter was deployed to ${swapRouter.address}`);
    // console.log(`nftDescriptor was deployed to ${nftDescriptor.address}`);
    // console.log(`quarter was deployed to ${quarter.address}`);
    // console.log(`quarterV2 was deployed to ${quarterV2.address}`);
    // console.log(`tokencheck was deployed to ${tokencheck.address}`);
    // console.log(`nonfungibleTokenPositionDescriptor was deployed to ${nonfungibleTokenPositionDescriptor.address}`);
    // console.log(`nonfungiblePositionManager was deployed to ${nonfungiblePositionManager.address}`);

    console.log('let WETH_ADDRESS=', `'${weth.address}'`)
    console.log('let FACTORY_ADDRESS=', `'${factory.address}'`)
    console.log('let SWAP_ROUTER_ADDRESS=', `'${swapRouter.address}'`)
    console.log('let NFT_DESCRIPTOR_ADDRESS=', `'${nftDescriptor.address}'`)
    console.log('let POSITION_DESCRIPTOR_ADDRESS=', `'${nonfungibleTokenPositionDescriptor.address}'`)
    //console.log('let POSITION_MANAGER_ADDRESS=', `'${nonfungiblePositionManager.address}'`)
    console.log('let Quarter_Address=', `'${quarter.address}'`);
    console.log('let QUOTER_V2_ADDRESS=', `'${quarterV2.address}'`);
    console.log('let TOKEN_CHECKER = ', `'${tokencheck.address}'`);


}
