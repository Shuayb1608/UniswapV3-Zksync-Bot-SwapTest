const { Position, maxLiquidityForAmounts, TickMath, nearestUsableTick, Pool } = require("@uniswap/v3-sdk")
const { Contract } = require("ethers")
const { ethers } = require("hardhat")
let JSBI = require('jsbi');
const { Token } = require('@uniswap/sdk-core');
const { Provider, PrivateKey } = require("./Utils");


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




const tokenId = 1;
let provider;
let poolData;
let positionDetails;

async function getPoolData(poolContract) {
    const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
    ])

    return {
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
    }
}
const artifacts = {
    NonfungibelPositionManager: require('../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
    INonfungiblePositionManager: require('../ABI/INonfungiblePositionManager.sol/INonfungiblePositionManager.json'),
    UniswapV3Pool: require("../ABI/UniswapV3Pool.sol/UniswapV3Pool.json")
}

const nonfugiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungibelPositionManager.abi,
    provider
)

async function main() {
    provider = await Provider;
    const privateKey = PrivateKey;
    const walletWithProvider = await new ethers.Wallet(privateKey, provider);
    const signer = await walletWithProvider.connect(provider);


    const poolContract = await new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)
    console.log('poolData---', await poolData);

    const positionDetails = await nonfugiblePositionManager.connect(signer).positions(tokenId)
    console.log(positionDetails);

    let maxLiquidityFromToken0 = maxLiquidityForAmounts(
        TickMath.getSqrtRatioAtTick(nearestUsableTick(poolData.tick, poolData.tickSpacing)),
        TickMath.getSqrtRatioAtTick(positionDetails?.tickLower),
        TickMath.getSqrtRatioAtTick(positionDetails?.tickUpper),
        "1000000000000000000",
        JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString()
    );
    const UsdtToken = new Token(80001, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    const UsdcToken = new Token(80001, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')
    const pool = new Pool(
        UsdtToken,
        UsdcToken,
        positionDetails.fee,
        poolData.sqrtPriceX96.toString(),
        positionDetails.liquidity.toString(),
        poolData.tick
    )
    const position = new Position({
        pool: pool,
        liquidity: maxLiquidityFromToken0.toString(),
        tickLower: positionDetails?.tickLower,
        tickUpper: positionDetails?.tickUpper,
    })

    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts


    console.log('====================================');
    console.log('Amount0Desired', amount0Desired.toString());
    console.log('amount1Desired ', amount1Desired.toString());
    console.log('====================================');

    let params = {
        tokenId: tokenId,
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        amount0Min: 0,
        amount1Min: 0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10)
    }

    const increase = await nonfugiblePositionManager.connect(signer).increaseLiquidity(
        params,
        { gasLimit: '1000000' }
    )
    await increase.wait();
    console.log('Increase Liquidity Transactions ', increase);
}

main().then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })