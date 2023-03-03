const JSBI = require('jsbi')
const { CurrencyAmount, TradeType, Percent } = require("@uniswap/sdk-core");
// const { AlphaRouter } = require("@uniswap/smart-order-router");
const { SqrtPriceMath } = require('@uniswap/v3-sdk');
const { Token } = require('@uniswap/sdk-core')
const { Fetcher, Route, WETH, ChainId } = require('@uniswap/sdk')




// Pool addresses
let USDT_USDC_500 = '0x0045ac7b7369F2f4721164eE3B1624Fa5261ed53'

// Token addresses
let TETHER_ADDRESS = '0x230B6a6De18B07baBaea666597f1d253094e86C4'
let USDC_ADDRESS = '0xB8c9674B94B417da6E1e92347e79190bE8940a21'
let WRAPPED_BITCOIN_ADDRESS = '0x45369ff05351327B75a152A02e2D548E4C74F0Ff'
let STABLE_ETH_ADDRESS = '0xb565AC73b110EE8adA2b8e8F35dEaf028d53d840'
// Uniswap contract address
let WETH_ADDRESS = '0xff7Bb8Ebb6254ae5F4456Ae718E86e1108583607'
let FACTORY_ADDRESS = '0x4b2E1481Fb1a3fcd2A0D1A325E7F2f56A4D030FE'
let SWAP_ROUTER_ADDRESS = '0xbd5B706dfAAc3ba573370eB38eA4823620F188C6'
let NFT_DESCRIPTOR_ADDRESS = '0x6CBC4DBBF4D542b39060058E28341786b077a2D5'
let POSITION_DESCRIPTOR_ADDRESS = '0xa6d745D4e3917226ea14457afBDf66010d7c9bfA'
let POSITION_MANAGER_ADDRESS = '0x23412861B14083224e20c6A5969e5E556Fa3d6F2'
let Quarter_Address = '0x7708fcfCd975E6C3B3452B9e86E5c3B0758655b4'



const artifacts = {
    swap_Router: require('../ABI/SwapRouter.sol/SwapRouter.json'),
    nonfungiblePositionManager: require('../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
    UniswapV3Pool: require('../ABI/UniswapV3Pool.sol/UniswapV3Pool.json'),
    Usdt: require('../artifacts/contracts/Tether.sol/Tether.json'),
    Usdc: require('../artifacts/contracts/UsdCoin.sol/UsdCoin.json')
}

const { Contract, BigNumber } = require('ethers')
const { ethers } = require("hardhat");
const { Provider, PrivateKey } = require('./Utils');

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
    console.log('Signer Address ', await signer.address)
    const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)
    console.log('poolData', poolData)

    const USDT = new Token(80001, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    const USDC = new Token(80001, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

    const pair = await Fetcher.fetchPairData(USDT, USDC, provider)
    console.log('pair', pair);

    // const route = new Route([pair], USDC, )

    // console.log(route.midPrice.toSignificant(6)) // 201.306
    // console.log(route.midPrice.invert().toSignificant(6)) // 0.00496756

    console.log('chala -------');


    // console.log('-----Swap Tx -----', swap);
}

main().then(() => { process.exit(0) }).catch((err) => { console.error(err); process.exit(1) })
