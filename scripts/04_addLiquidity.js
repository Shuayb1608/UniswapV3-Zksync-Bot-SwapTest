

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


let JSBI = require('jsbi');
let liquidityValue;
let amount0Values;
let amount1Values;
let params;

const artifacts = {
  NonfungiblePositionManager: require("../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Usdt: require("../artifacts/contracts/Tether.sol/Tether.json"),
  Usdc: require("../artifacts/contracts/UsdCoin.sol/UsdCoin.json"),
  UniswapV3Pool: require("../ABI/UniswapV3Pool.sol/UniswapV3Pool.json")
};

const { Contract } = require("ethers")
const { Token } = require('@uniswap/sdk-core')
const { Pool, Position, nearestUsableTick, TickMath, maxLiquidityForAmounts } = require('@uniswap/v3-sdk');
const { ethers } = require('hardhat');
const { Provider, PrivateKey } = require('./Utils')


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

function getTickFromPrice(price) {
  // let lowerPrice = 1.001;
  let tick = 0;
  let index = 0;

  let newDiffrence = Infinity;
  let previousDifference = Infinity;

  if (price < 1.0001) {

    while (Math.abs(newDiffrence) <= Math.abs(previousDifference)) {

      newDiffrence = price - (1.0001 ** (index - 1));
      previousDifference = price - (1.0001 ** (index));

      if (Math.abs(newDiffrence) > Math.abs(previousDifference)) {
        tick = index;
      } else {
        index--;
      }

    }

  } else {
    while (Math.abs(newDiffrence) <= Math.abs(previousDifference)) {
      newDiffrence = price - (1.0001 ** index);
      previousDifference = price - (1.0001 ** (index - 1));

      if (Math.abs(newDiffrence) > Math.abs(previousDifference)) {
        tick = index - 1;
      } else {
        index++;
      }

    }
  }

  return tick
}



async function main() {
  // const [owner, signer2] = await ethers.getSigners();
  // const provider = waffle.provider;
  const provider = await Provider;
  const privateKey = PrivateKey;


  let walletWithProvider = await new ethers.Wallet(privateKey, provider)

  const signer = await walletWithProvider.connect(provider);
  console.log("signer address:", signer.address);

  const usdtContract = new Contract(TETHER_ADDRESS, artifacts.Usdt.abi, provider)
  const usdcContract = new Contract(USDC_ADDRESS, artifacts.Usdc.abi, provider)

  await usdtContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('100000'))
  await usdcContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('100000'))


  const poolContract = new Contract(USDT_USDC_500, artifacts.UniswapV3Pool.abi, provider)

  const poolData = await getPoolData(poolContract)


  // ----------------------------------------------------------------------------------------------

  // This Part is not required because this part is calculating the amount0desired and amount1desired on behalf of liquidity we provide.
  // But we don't want that, we want to send amount of tokens what user wants to send.
  // So we will let the smart contract calculate liquidity on behalf of the value we provide.

  const UsdtToken = new Token(80001, TETHER_ADDRESS, 18, 'USDT', 'Tether')
  const UsdcToken = new Token(80001, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')
  console.log(' poolData.fee', poolData.fee);

  const pool = new Pool(
    UsdtToken,
    UsdcToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  )


  // const position = new Position({
  //   pool: pool,
  //   // liquidity: ethers.utils.parseEther('100'),
  //   liquidity: maxLiquidityForAmounts(poolData.sqrtPriceX96 ,TickMath.getSqrtRatioAtTick(57040),TickMath.getSqrtRatioAtTick(63970),"1000000000000000000","1500000000000000000000",false ),
  //   tickLower: nearestUsableTick(-50, poolData.tickSpacing),
  //   tickUpper: nearestUsableTick(10, poolData.tickSpacing),
  // })
  // liquidityValue = position.liquidity
  // amount0Values = liquidityValue/2;
  // amount1Values = liquidityValue/2;

  // let maxLiquidityFromToken0 = maxLiquidityForAmount0Precise(
  //   TickMath.getSqrtRatioAtTick(nearestUsableTick(getTickFromPrice(0.995), poolData.tickSpacing)),
  //   TickMath.getSqrtRatioAtTick(nearestUsableTick(getTickFromPrice(1.001), poolData.tickSpacing)),
  //   "1000000000000000000"
  // )

  let calcLowerNearestUsableTick = nearestUsableTick(getTickFromPrice(0.995), poolData.tickSpacing)
  let calcUpperNearestUsableTick = nearestUsableTick(getTickFromPrice(1.001), poolData.tickSpacing) 

  console.log("calcLowerNearestUsableTick", calcLowerNearestUsableTick);
  console.log("calcUpperNearestUsableTick", calcUpperNearestUsableTick);

  let maxLiquidityFromToken0 = maxLiquidityForAmounts(
    TickMath.getSqrtRatioAtTick(nearestUsableTick(poolData.tick, poolData.tickSpacing)), 
    TickMath.getSqrtRatioAtTick(calcLowerNearestUsableTick),
    TickMath.getSqrtRatioAtTick(calcUpperNearestUsableTick),
   ethers.utils.parseEther('1000'),
    JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toString()
  );

  // console.log('====================================');
  // console.log("maxLiquidityFromToken0---",maxLiquidityFromToken0);
  // console.log(maxLiquidityFromToken0.toString());
  // console.log(TickMath.getSqrtRatioAtTick(nearestUsableTick(getTickFromPrice(0.995), poolData.tickSpacing)).toString(),
  // TickMath.getSqrtRatioAtTick(nearestUsableTick(getTickFromPrice(1.001), poolData.tickSpacing)).toString(),);
  // console.log(poolData.sqrtPriceX96.toString());
  // console.log('====================================');

  const position = new Position({
    pool: pool,
    liquidity: maxLiquidityFromToken0.toString(),
    tickLower: calcLowerNearestUsableTick,
    tickUpper: calcUpperNearestUsableTick,
  })

  // console.log('====================================');
  // console.log(position);
  // console.log('====================================');

  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts


  console.log('====================================');
  console.log('Amount0Desired', amount0Desired.toString());
  console.log('amount1Desired ', amount1Desired.toString());
  console.log('====================================');
  // ----------------------------------------------------------------------------------------------------//



  console.log(nearestUsableTick(poolData.tick, poolData.tickSpacing));


  // console.log("LowerTick", getTickFromPrice(300));
  // console.log("UpperTick", getTickFromPrice(600));


  params = {
    token0: TETHER_ADDRESS,
    token1: USDC_ADDRESS,
    fee: poolData.fee,
    tickLower: calcLowerNearestUsableTick,
    tickUpper: calcUpperNearestUsableTick,
    amount0Desired: amount0Desired.toString(),
    // amount1Desired: "5000000000000000000",
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }


  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )


  const tx = await nonfungiblePositionManager.connect(signer).mint(
    params,
    { gasLimit: '1000000' }


  )
  const receipt = await tx.wait()
  console.log(receipt);

  // let event1 = receipt.events[5];
  // console.log("11111", event1);
  // let value1 = event1.args;
  // console.log("2222222",value1);
  // let tokenId1 = value1[2].toNumber();
  // console.log("token o=id0000", tokenId1);

  console.log("done=-------");
  // console.log('TokenID',receipt.events[5].args.tokenId)

}

/*
npx hardhat run --network localhost scripts/04_addLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });