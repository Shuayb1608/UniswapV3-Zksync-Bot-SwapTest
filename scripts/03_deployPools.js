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
  UniswapV3Factory: require("../ABI/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json")
};

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
const { waffle, ethers } = require("hardhat")
const { Provider } = require("./Utils")
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

async function main() {
  const provider = await Provider;
  function encodePriceSqrt(reserve1, reserve0) {
    // console.log("reserve1" , reserve1.toString());
    // console.log("reserve0" , reserve0.toString());
    return BigNumber.from(new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
    )
  }
  // console.log("reserve0" , reserve0);


  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )
  const factory = new Contract(
    FACTORY_ADDRESS,
    artifacts.UniswapV3Factory.abi,
    provider
  )


  async function deployPool(token0, token1, fee, price) {
    const [owner] = await ethers.getSigners();
    console.log("Owner Address ----------", owner);
    let aaloo = await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
      token0,
      token1,
      fee,
      price,
      { gasLimit: 5000000 }
    )


    // console.log(aaloo, "kachalu");
    console.log("0-----------");
    await aaloo.wait();

    console.log("1------------------");


    const poolAddress = await factory.connect(owner).getPool(
      token0,
      token1,
      fee,
    )
    return poolAddress
  }
  console.log("2------------------------");




  console.log("3-------------------------------------");

  console.log('Encode Price ', encodePriceSqrt(1, 1).toString());
  console.log('Encode Price ', encodePriceSqrt(1, 1.1).toString());
  const usdtUsdc500 = await deployPool(TETHER_ADDRESS, USDC_ADDRESS, 500, encodePriceSqrt(1, 1))

  // encodePriceSqrt(1, 1) means that 1 token equals to 1 USDC.
  // encodePriceSqrt(1, 100) will mean that 1 token equals to 100 USDC.
  // In our case we want the token to be equal if we want to send the same amount of tokens in the pool.


  console.log('let USDT_USDC_500=', `'${usdtUsdc500}'`)
  // console.log("Encode Price ",`${encodePriceSqrt(500,1).toString()}`)

}




/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });