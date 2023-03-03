// Pool addresses
let USDT_USDC_500 = '0x3C068bd514768D69455310bEa4DBa5D126C9A95d'

// Token addresses
let TETHER_ADDRESS = '0x563A5dB7b865703f6E26C72348A900525B29ee12'
let USDC_ADDRESS = '0xB1c6fFa93d8E13cd28DEa06969735A08472c28d5'
let WRAPPED_BITCOIN_ADDRESS = '0x1e970d4eF842Cc8AAFceDE7c6d6e47dE6182303C'
let STABLE_ETH_ADDRESS = '0xA0863011853b6c7b3f063921f47b1792BFE88fe1'
// Uniswap contract address
let WETH_ADDRESS = '0x6FD4cD3d63F8cE423264560a718c763176ba59A0'
let FACTORY_ADDRESS = '0x4A7fB5969e019DD1e1d22299fFF389837B5377e2'
let SWAP_ROUTER_ADDRESS = '0x7BF80ffba28F9D4690569D671Ef8c713733b3154'
let NFT_DESCRIPTOR_ADDRESS = '0xAa4506EDD0976bc9671C137c700ff8878BD903A3'
let POSITION_DESCRIPTOR_ADDRESS = '0x8Ca33D2F917DA899CdF9cfC8F452E89A4A3878Ae'
let POSITION_MANAGER_ADDRESS = '0x0653Ef28318B6E697c2110485CF53876d1695a0C'
let Quarter_Address = '0x94cd962F164Cafa8bf7785f9E5538e46c7077Df4'
let QUOTER_V2_ADDRESS = '0x66DF8D772e5d4fA402142E7eB39375232BE6573C'

const artifacts = {
    swap_Router: require('../ABI/SwapRouter.sol/SwapRouter.json'),
    nonfungiblePositionManager: require('../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
    UniswapV3Pool: require('../ABI/UniswapV3Pool.sol/UniswapV3Pool.json'),
    Usdt: require('../artifacts/contracts/Tether.sol/Tether.json'),
    Usdc: require('../artifacts/contracts/UsdCoin.sol/UsdCoin.json')
}

const { Contract, BigNumber } = require('ethers')
const { ethers } = require("hardhat");
const { PrivateKey, Provider } = require('./Utils')

async function getPoolData(poolContract) {
    const [tickSpacing, fee, liquidity, slot0,] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
    ])

    return {
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity.toString(),
        sqrtPriceX96: slot0[0],
        tick: slot0[1],

    }
}



async function main() {
    const provider = await Provider;
    const privateKey = PrivateKey;
    const walletWithProvider = await new ethers.Wallet(privateKey, provider)
    const signer = await walletWithProvider.connect(provider)
    console.log('Signer Address ', await signer.address);
    const SwapRouter = new Contract(
        SWAP_ROUTER_ADDRESS,
        artifacts.swap_Router.abi,
        provider
    )

    const usdtContract = new Contract(TETHER_ADDRESS, artifacts.Usdt.abi, provider)
    // const usdcContract = new Contract(USDC_ADDRESS, artifacts.Usdc.abi, provider)
    // const manager = new Contract()
    // await usdtContract.connect(signer).transferFrom(signer.address, SWAP_ROUTER_ADDRESS,ethers.utils.parseEther('100000'))
    
    await usdtContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('100000'))
    // await usdcContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, ethers.utils.parseEther('100000'))
    // await usdtContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('100000'))
    // await usdcContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('100000'))


    const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)
    console.log('PoolData', poolData);

    let params = {
        tokenIn: TETHER_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: poolData.fee,
        recipient: (signer.address).toString(),
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: ethers.utils.parseEther('10'),
        amountOutMinimum: ethers.utils.parseEther('9'),
        sqrtPriceLimitX96: 0
    }

    console.log('Deadline', Math.floor(Date.now() / 1000) + (60 * 10));
    console.log('amountIn ', ethers.utils.parseEther('10').toString());


    const swap = await SwapRouter.connect(signer).exactInputSingle(
        params,
        {gasLimit: ethers.utils.hexlify(1000000)}
    )
    await swap.wait();

    console.log('-----Swap Tx -----', swap);
}

main().then(() => { process.exit(0) }).catch((err) => { console.error(err); process.exit(1) })
