// pool
let USDT_USDC_500= '0x3C068bd514768D69455310bEa4DBa5D126C9A95d'

const UniswapV3Pool = require("../ABI/UniswapV3Pool.sol/UniswapV3Pool.json")
const { Contract } = require("ethers")
const { Provider, PrivateKey } = require("./Utils")
// const { waffle } = require("hardhat")

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0, ] = await Promise.all([
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
  // const provider = waffle.provider;
  const provider = await Provider;
  const privateKey = PrivateKey;
  let walletWithProvider = await new ethers.Wallet(privateKey, provider)
  
  const signer = await walletWithProvider.connect(provider);
  console.log("signer address:", signer.address);

  const poolContract = new Contract(USDT_USDC_500, UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)
  console.log('poolData', poolData)

  
 
}

/*
npx hardhat run --network localhost scripts/05_checkLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });