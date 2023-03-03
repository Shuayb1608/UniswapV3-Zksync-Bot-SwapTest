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


const { Pool, computePoolAddress } = require("@uniswap/v3-sdk");
const { Contract, ContractFactory } = require("ethers");
const { ethers } = require("hardhat");
const { Token } = require('@uniswap/sdk-core');
const JSBI = require('jsbi')
const { Provider, PrivateKey } = require("./Utils")
// const {toReadableAmount, fromReadableAmount} = require('../scripts/Libs/Functions');


function countDecimals(x) {
    if (Math.floor(x) === x) {
        return 0
    }
    return x.toString().split('.')[1].length || 0
}

function fromReadableAmount(amount, decimals) {
    const extraDigits = Math.pow(10, countDecimals(amount))
    const adjustedAmount = amount * extraDigits
    return JSBI.divide(
        JSBI.multiply(
            JSBI.BigInt(adjustedAmount),
            JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
        ),
        JSBI.BigInt(extraDigits)
    )
}



const artifacts = {
    multicall: require("../artifacts/contracts/Multicall.sol/Multicall.json"),
    UniswapV3Pool: require('../ABI/UniswapV3Pool.sol/UniswapV3Pool.json'),
    Quoter: require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'),
    QuoterV2: require('../ABI/QuoterV2.sol/QuoterV2.json')
}

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
        tick: slot0[1]
    }
}

function sqrtToPrice(sqrt, decimals0, decimals1, token0IsInput) {
    const numerator = sqrt ** 2
    const denominator = 2 ** 192
    let ratio = numerator / denominator
    const shiftDecimals = Math.pow(10, decimals0 - decimals1)

    ratio = ratio * shiftDecimals

    if (!token0IsInput) {
        ratio = 1 / ratio
    }

    return ratio
}
async function main() {
    const [owner] = await ethers.getSigners()
    const provider = await Provider;
    const privateKey = PrivateKey;
    const walletWithProvider = await new ethers.Wallet(privateKey, provider);
    const signer = await walletWithProvider.connect(provider);
    console.log('Signer Address ', signer.address);
    // console.log('Owner' , owner);
    console.log('Owner Address', owner.address);

    const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)
    console.log(poolData);

    const UsdtToken = new Token(80001, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    const UsdcToken = new Token(80001, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')
    const quoterContract = new ethers.Contract(Quarter_Address, artifacts.Quoter.abi, provider)
    const quoterV2Contract = new ethers.Contract(QUOTER_V2_ADDRESS, artifacts.QuoterV2.abi, provider)



    const currentPooolAddress = computePoolAddress({
        factoryAddress: FACTORY_ADDRESS,
        tokenA: UsdtToken,
        tokenB: UsdcToken,
        fee: poolData.fee
    })


    // Example Configuration

    const CurrentConfig = {
        tokens: {
            in: UsdtToken,
            amountIn: 1000,
            out: UsdcToken,
            fee: poolData.fee,
        },
    }

    // ------------------------------------------------

    // ------------------------------------------------

    // Getting Quotes from the Quoter contract

    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
        TETHER_ADDRESS,
        USDC_ADDRESS,
        poolData.fee,
        fromReadableAmount(
            CurrentConfig.tokens.amountIn,
            CurrentConfig.tokens.in.decimals
        ).toString(),
        0
    )
    const quotedExactOutput = await quoterContract.callStatic.quoteExactOutputSingle(
        TETHER_ADDRESS,
        USDC_ADDRESS,
        poolData.fee,
        fromReadableAmount(
            CurrentConfig.tokens.amountIn,
            CurrentConfig.tokens.in.decimals
        ).toString(),
        0
    )


    console.log('currentPooolAddress', currentPooolAddress);
    console.log('quotedAmountOut', quotedAmountOut);
    // console.log('quotedExactOutput', quotedExactOutput);




    let params = {
        tokenIn: TETHER_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: poolData.fee,
        amountIn: ethers.utils.parseEther('1000'),
        sqrtPriceLimitX96: '0'
    }

    const quoto = await quoterV2Contract.callStatic.quoteExactInputSingle(params)
    console.log('quoto', quoto);
    const sqrtPriceX96After = quoto.sqrtPriceX96After
    console.log('sqrtPriceX96',poolData.sqrtPriceX96);
    console.log('sqrtPriceX96After',sqrtPriceX96After);
    const price = sqrtToPrice(poolData.sqrtPriceX96, 18, 18, true)
    const priceAfter = sqrtToPrice(sqrtPriceX96After, 18, 18, true)
    console.log('price', price);
    console.log('priceAfter', priceAfter);

    const absoluteChange = price - priceAfter
    const percentChange = absoluteChange / price

    console.log('persent change', (percentChange * 100).toFixed(3), '%');

}


main().then(() => process.exit(0)).catch((error) => {
    console.log(error);
    process.exit(1);
})