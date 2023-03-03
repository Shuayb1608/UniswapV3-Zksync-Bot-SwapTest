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




let provider;
let positionDetail;

const { Pool, nearestUsableTick, maxLiquidityForAmounts, Position, TickMath } = require("@uniswap/v3-sdk")
const { Token } = require('@uniswap/sdk-core')
const { Contract, BigNumber } = require("ethers");
const { ethers } = require("hardhat");
let JSBI = require('jsbi');
const bn = require('bignumber.js')
const { Provider, PrivateKey } = require("./Utils")
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

const artifacts = {
    NonfungibelPositionManager: require('../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
    INonfungiblePositionManager: require('../ABI/INonfungiblePositionManager.sol/INonfungiblePositionManager.json'),
    UniswapV3Pool: require("../ABI/UniswapV3Pool.sol/UniswapV3Pool.json")
}
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


const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungibelPositionManager.abi,
    provider
)



async function main() {
   provider = await Provider;
   const privateKey = PrivateKey;

    const walletWithProvider = await new ethers.Wallet(privateKey, provider);
    const signer = await walletWithProvider.connect(provider);


    const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)

    let tokenId = 1;
    let percent = '50'

    const position = new Contract (POSITION_MANAGER_ADDRESS,artifacts.NonfungibelPositionManager.abi,provider )
    positionDetail = await position.connect(signer).positions(tokenId)
    
    let liquidity = positionDetail?.liquidity;
    console.log('Pool data ', poolData);
    console.log('');
    

    console.log('positionDetail' ,positionDetail);

    function encodePercentage(amount, percent) {
        let calc = BigNumber.from(amount.toString()).mul(percent).toString()
        let calculation = BigNumber.from(calc).div(100).toString()
        console.log('---------------------', calculation);
        return calculation;
    }
    let params = {
        tokenId: tokenId,
        liquidity: encodePercentage(liquidity, percent).toString(),
        amount0Min: 0,
        amount1Min: 0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10)
    }
    let collectFeeparams = {
        tokenId: tokenId,
        recipient: '0xb9B2c57e5428e31FFa21B302aEd689f4CA2447fE',
        amount0Max: MAX_UINT128,
        amount1Max: MAX_UINT128
    }

    console.log('Deadline', Math.floor(Date.now() / 1000) + (60 * 10));
    console.log('Decrease Liquidity Transaction chal rahi hai ');
    const tx = await nonfungiblePositionManager.connect(signer).decreaseLiquidity(
        params,
        { gasLimit: '1000000' }
    )
    await tx.wait();
    console.log('Decrease Liquidity Transaction ho gai ');
    console.log('Transaction ', tx);


    console.log('Collect transaction ho rahi hai ');
    const collectFee = await nonfungiblePositionManager.connect(signer).collect(
        collectFeeparams,
        { gasLimit: '1000000' }
    )
    await collectFee.wait()
    console.log('Collect Fee transaction Details' , collectFee);
    console.log('Collect transaction ho gai ');
}




main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });