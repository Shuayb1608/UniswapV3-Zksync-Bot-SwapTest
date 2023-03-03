const { ethers } = require("hardhat");
const { Provider, PrivateKey } = require("./Utils");

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Owner " , owner);  

  Tether = await ethers.getContractFactory('Tether', owner);
  tether = await Tether.deploy();

  Usdc = await ethers.getContractFactory('UsdCoin', owner);
  usdc = await Usdc.deploy();

  WrappedBitcoin = await ethers.getContractFactory('WrappedBitcoin', owner);
  wrappedBitcoin = await WrappedBitcoin.deploy();

  StableETH = await ethers.getContractFactory('StableETH', owner)
  stableETH = await StableETH.deploy();


  // const provider = await new  ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/3mQyQQlouZSpP9urDglk3M9XLmlgoxmp");
  // const provider = await new  ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/I5AsJB8XX-iWDL0WmdODLAtjNSSvfi_x");
  // let  privateKey = await '8ede05ba12e23a241c12d2cad5831ec529b19e937d687527239db8f7bca38737';

  const provider = await Provider;
  const privateKey = await PrivateKey;
  let walletWithProvider = await new ethers.Wallet(privateKey, provider)

  const signer = await walletWithProvider.connect(provider);
  console.log("signer address:", signer.address);

  await tether.connect(owner).mint(
    signer.address,
    ethers.utils.parseEther('1000000000')
  )
  await usdc.connect(owner).mint(
    signer.address,
    ethers.utils.parseEther('1000000000')
  )
  await wrappedBitcoin.connect(owner).mint(
    signer.address,
    ethers.utils.parseEther('1000000000')
  )
  await stableETH.connect(owner).mint(
    signer.address,
    ethers.utils.parseEther('1000000000')
  )

  console.log('let TETHER_ADDRESS=', `'${tether.address}'`)
  console.log('let USDC_ADDRESS=', `'${usdc.address}'`)
  console.log('let WRAPPED_BITCOIN_ADDRESS=', `'${wrappedBitcoin.address}'`)
  console.log('let STABLE_ETH_ADDRESS=', `'${stableETH.address}'`)

}

/*
npx hardhat run --network localhost scripts/02_deployTokens.js
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });