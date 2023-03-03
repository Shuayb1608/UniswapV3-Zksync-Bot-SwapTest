const { Contract, ContractFactory, utils, BigNumber } = require("ethers")
const WETH9 = require("../WETH9.json");
const { ethers } = require("hardhat");

const artifacts = {
  // SwapRouterAddress 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  UniswapV3Factory: require("../ABI/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("../ABI/SwapRouter.sol/SwapRouter.json"),
  NFTDescriptor: require("../ABI/NFTDescriptor.sol/NFTDescriptor.json"),
  NonfungibleTokenPositionDescriptor: require("../ABI/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  NonfungiblePositionManager: require("../ABI/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Quoter: require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'),
  QuoterV2: require('../ABI/QuoterV2.sol/QuoterV2.json'),
  WETH9,
  tokenCheck: require('../artifacts/contracts/TokenChecker.sol/tokenCheck.json')
};


const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  Object.keys(linkReferences).forEach((fileName) => {
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`)
      }
      const address = utils
        .getAddress(libraries[contractName])
        .toLowerCase()
        .slice(2)
      linkReferences[fileName][contractName].forEach(
        ({ start, length }) => {
          const start2 = 2 + start * 2
          const length2 = length * 2
          bytecode = bytecode
            .slice(0, start2)
            .concat(address)
            .concat(bytecode.slice(start2 + length2, bytecode.length))
        }
      )
    })
  })
  return bytecode
}

async function main() {
  const [owner] = await ethers.getSigners();

  let Weth = new ContractFactory(artifacts.WETH9.abi, artifacts.WETH9.bytecode, owner);
  let weth = await Weth.deploy();

  let Factory = new ContractFactory(artifacts.UniswapV3Factory.abi, artifacts.UniswapV3Factory.bytecode, owner);
  factory = await Factory.deploy();

  let SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner);
  swapRouter = await SwapRouter.deploy(factory.address, weth.address);

  let NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, owner);
  let nftDescriptor = await NFTDescriptor.deploy();

  let Quarter = new ContractFactory(artifacts.Quoter.abi, artifacts.Quoter.bytecode, owner);
  let quarter = await Quarter.deploy(factory.address, weth.address);

  let QuarterV2 = new ContractFactory(artifacts.QuoterV2.abi, artifacts.QuoterV2.bytecode, owner);
  let quarterV2 = await QuarterV2.deploy(factory.address, weth.address);

  let TokenChecker = new ContractFactory(artifacts.tokenCheck.abi, artifacts.tokenCheck.bytecode, owner);
  let tokencheck = await TokenChecker.deploy();

  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        "NFTDescriptor.sol": {
          NFTDescriptor: [
            {
              length: 20,
              start: 1681,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    }
  );

  const _nativeCurrencyLabelBytes = utils.formatBytes32String("ETH");

  NonfungibleTokenPositionDescriptor = new ContractFactory(artifacts.NonfungibleTokenPositionDescriptor.abi, linkedBytecode, owner);
  nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(weth.address, _nativeCurrencyLabelBytes);

  NonfungiblePositionManager = new ContractFactory(artifacts.NonfungiblePositionManager.abi, artifacts.NonfungiblePositionManager.bytecode, owner);
  nonfungiblePositionManager = await NonfungiblePositionManager.deploy(factory.address, weth.address, nonfungibleTokenPositionDescriptor.address);

  console.log('let WETH_ADDRESS=', `'${weth.address}'`)
  console.log('let FACTORY_ADDRESS=', `'${factory.address}'`)
  console.log('let SWAP_ROUTER_ADDRESS=', `'${swapRouter.address}'`)
  console.log('let NFT_DESCRIPTOR_ADDRESS=', `'${nftDescriptor.address}'`)
  console.log('let POSITION_DESCRIPTOR_ADDRESS=', `'${nonfungibleTokenPositionDescriptor.address}'`)
  console.log('let POSITION_MANAGER_ADDRESS=', `'${nonfungiblePositionManager.address}'`)
  console.log('let Quarter_Address=', `'${quarter.address}'`);
  console.log('let QUOTER_V2_ADDRESS=', `'${quarterV2.address}'`);
  console.log('let TOKEN_CHECKER = ', `'${tokencheck.address}'`);
}


/*
npx hardhat run --network localhost scripts/01_deployContracts.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });