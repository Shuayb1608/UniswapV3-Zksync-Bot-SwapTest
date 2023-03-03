

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

    let ad1 = ethers.utils.getAddress('0x1a257e9D863afF27B2F2EC5D15F1f88293ad66F1')
    let ad2 = ethers.utils.getAddress('0x3707761228EE69eFF7138BdA9018eE73A60acE9A')
    let ad3 = ethers.utils.getAddress('0x757cad74df39e67e5a775D5e21913531eF9f8eB7')
    let ad4 = ethers.utils.getAddress('0x2da3A1FE894D4f9966C50921a04A72e37869758A')
    // const _nativeCurrencyLabelBytes = formatBytes32String("ETH");

    // let NonfungibleTokenPositionDescriptor = new ContractFactory(artifacts.NonfungibleTokenPositionDescriptor_zk.abi, artifacts.NonfungibleTokenPositionDescriptor_zk.bytecode, deployer.zkWallet);
    // let nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(ad2, _nativeCurrencyLabelBytes);
    let NonfungiblePositionManager = new ContractFactory(artifacts.NonfungiblePositionManager_zk.abi, artifacts.NonfungiblePositionManager_zk.bytecode, deployer.zkWallet);
    console.log('----------------------------------------------');
    
    let nonfungiblePositionManager = await NonfungiblePositionManager.deploy(ad1, ad2, ad4 )
    // console.log('nonfungiblePositionManager',nonfungiblePositionManager);

    console.log('Address ----' ,nonfungiblePositionManager.address);
    console.log('----------------------------------------------');

}


