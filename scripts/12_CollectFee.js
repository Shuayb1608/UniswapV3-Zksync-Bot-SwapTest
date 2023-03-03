const { CurrencyAmount } = require('@uniswap/sdk')
const { NonfungiblePositionManager } = require('@uniswap/v3-sdk')
const { Contract } = require('ethers')
const { Provider, PrivateKey } = require('./Utils')

// Pool addresses
let USDT_USDC_500 = '0x46Ee2B39fB7280BCE26cAD9eAc14b373656CA6a1'

// Token addresses
let TETHER_ADDRESS = '0x14765Dc456FA9646F46230AFC7380C9EAb0e4d46'
let USDC_ADDRESS = '0xff7519605a710E106b3D7e07E0Ba1419fC3f8CB5'
let WRAPPED_BITCOIN_ADDRESS = '0x8caABECB31Bc2BA9B25F2ceAfaC0dB0350EDC7C8'
// Uniswap contract address
let WETH_ADDRESS = '0x9B555046e8f3CBf549bfDbE3695CCbbD609E07cc'
let FACTORY_ADDRESS = '0x8252AD47488fA0E34dCB8A97B52B778187A5f868'
let SWAP_ROUTER_ADDRESS = '0x9B9451BEA06Aaac27Dc300b30D65E31b8a204fd4'
let NFT_DESCRIPTOR_ADDRESS = '0xc448676A56540BC3Ae099E50Da4AbBaEfA906b9d'
let POSITION_DESCRIPTOR_ADDRESS = '0x7CD305f6F0d9e5cA79Cfe1f2c252Aec1058AE190'
let POSITION_MANAGER_ADDRESS = '0x11711af616eeC6809DA96cc63bA0302DC626d876'

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


async function main() {


    const provider = await Provider;
    const privateKey = PrivateKey;
    // provider = await new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/I5AsJB8XX-iWDL0WmdODLAtjNSSvfi_x");
    const walletWithProvider = await new ethers.Wallet(privateKey, provider);
    const signer = await walletWithProvider.connect(provider);
    console.log('Signer Address - ', signer.address);


    const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)
    const poolData = await getPoolData(poolContract)
    console.log('PoolData', poolData);
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });