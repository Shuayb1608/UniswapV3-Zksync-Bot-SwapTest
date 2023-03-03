const { ethers } = require("ethers");

const PrivateKey = '8ede05ba12e23a241c12d2cad5831ec529b19e937d687527239db8f7bca38737';
const Provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/3mQyQQlouZSpP9urDglk3M9XLmlgoxmp");
//const Provider = await new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/I5AsJB8XX-iWDL0WmdODLAtjNSSvfi_x");

module.exports = {
    PrivateKey,
    Provider
}