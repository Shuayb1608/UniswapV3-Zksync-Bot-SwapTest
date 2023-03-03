const { ethers } = require('ethers')
const { Provider, PrivateKey } = require('./Utils')
// const { getPoolImmutables, getPoolState } = require('./helpers')

const artifacts = {
    UniswapV3Pool: require('../ABI/UniswapV3Pool.sol/UniswapV3Pool.json'),
    SwapRouter: require('../ABI/SwapRouter.sol/SwapRouter.json'),
    ERC20: require("../WETH9.json")
}

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

const WALLET_SECRET = PrivateKey;

const provider =  Provider;
const poolAddress = USDT_USDC_500;
const swapRouterAddress = SWAP_ROUTER_ADDRESS;

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = TETHER_ADDRESS

const name1 = 'Uniswap Token'
const symbol1 = 'UNI'
const decimals1 = 18
const address1 = USDC_ADDRESS
async function getPoolData(poolContract) {
    const [tickSpacing, fee, liquidity, slot0, token0, token1] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
        poolContract.token0(),
        poolContract.token1(),
    ])

    return {
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity.toString(),
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
        token0,
        token1
    }
}

async function main() {

    const walletWithProvider = await new ethers.Wallet(WALLET_SECRET,provider)
    const signer = await walletWithProvider.connect(provider)

    const poolContract = await new ethers.Contract(
        poolAddress,
        artifacts.UniswapV3Pool.abi,
        provider
    )

    const immutables = await getPoolData(poolContract)
    //   const state = await getPoolState(poolContract)

    // const connectedWallet = await wallet.connect(provider)

    const swapRouterContract = await new ethers.Contract(
        swapRouterAddress,
        artifacts.SwapRouter.abi,
        provider
    )

    const inputAmount = 10;
    // .001 => 1 000 000 000 000 000
    const amountIn = await ethers.utils.parseEther(inputAmount.toString())

    // const approvalAmount = await (amountIn * 100000).toString()

    const tokenContract0 = await new ethers.Contract(
        address1,
        artifacts.ERC20.abi,
        provider
    )

    console.log("jhkjk");

    const approvalResponse = await tokenContract0.connect(signer).approve(swapRouterAddress, ethers.utils.parseEther('100'))

    const approvalResponse2 = await tokenContract0.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('100'))
        

    await approvalResponse.wait()
    await approvalResponse2.wait()


    console.log("immutables", immutables);

    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: immutables.fee,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    const transaction = await swapRouterContract.connect(signer).exactInputSingle(
        params,
        {
            gasLimit: ethers.utils.hexlify(1000000)
        }
    )

    await transaction.wait()
    console.log('Transactions Details ', transaction);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1) })