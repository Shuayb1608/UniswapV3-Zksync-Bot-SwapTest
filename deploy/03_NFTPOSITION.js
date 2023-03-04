

const { Wallet, utils, ContractFactory } = require("zksync-web3");
const ethers = require("ethers");
const { HardhatRuntimeEnvironment } = require("hardhat/types");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");
const { PrivateKey } = require("../scripts/Utils");
const { formatBytes32String } = require("ethers/lib/utils");

const artifacts = {
    NonfungibleTokenPositionDescriptor_zk: require("../ABI-zk/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
    NonfungiblePositionManager_zk: require("../ABI-zk/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};



module.exports = async function main(hre) {
    console.log(`Running deploy script for the Greeter contract`);
    const wallet = new Wallet(`${PrivateKey}`);
    const deployer = new Deployer(hre, wallet);

    let ad1 = ethers.utils.getAddress('0xee3FeB853C2f3AD868a68261f916eA55B26A2729')
    let ad2 = ethers.utils.getAddress('0x55CEB8373836b7b8B51933b57329c5C3a67d8408')
    let ad3 = ethers.utils.getAddress('0x0b93121DF6c8c90105AfBFf9d37e80410901984c')
    
    // const _nativeCurrencyLabelBytes = formatBytes32String("ETH");

    // let NonfungibleTokenPositionDescriptor = new ContractFactory(artifacts.NonfungibleTokenPositionDescriptor_zk.abi, artifacts.NonfungibleTokenPositionDescriptor_zk.bytecode, deployer.zkWallet);
    // let nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(ad2, _nativeCurrencyLabelBytes);
    //let NonfungiblePositionManager = new ContractFactory(artifacts.NonfungiblePositionManager_zk.abi, artifacts.NonfungiblePositionManager_zk.bytecode, deployer.zkWallet);
    console.log('----------------------------------------------');
    
    let deployContract = await deployer.loadArtifact("NonfungiblePositionManager");
    let contract2 = await deployer.deploy(deployContract, [ad1, ad2, ad3]);
    // console.log('nonfungiblePositionManager',nonfungiblePositionManager);

    console.log('Address ----' ,(await contract2).address);
    console.log('----------------------------------------------');

}



