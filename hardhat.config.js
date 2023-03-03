
require("@nomiclabs/hardhat-waffle");
require('@matterlabs/hardhat-zksync-deploy')
require('@matterlabs/hardhat-zksync-solc')

const ALCHEMY_API_KEY = "3mQyQQlouZSpP9urDglk3M9XLmlgoxmp";
const GOERLI_API_KEY = "I5AsJB8XX-iWDL0WmdODLAtjNSSvfi_x";
const MUMBAI_PRIVATE_KEY = "0xadf787d3490ae2a37e70df7fc654be598cd91d6f2932f68bc62c99b2e88bb376";

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
        details: { yul: false },
      },
    }
  },

  zksolc: {
    version: "1.3.1",
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",

  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [MUMBAI_PRIVATE_KEY]
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_API_KEY}`,
      accounts: [MUMBAI_PRIVATE_KEY]
    },
    zkSyncTestnet: {
      url: "https://zksync2-testnet.zksync.dev",
      ethNetwork: "goerli", // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
    },
    hardhat: {
      zksync: true
    }
  },
};




// require("@matterlabs/hardhat-zksync-deploy");
// require("@matterlabs/hardhat-zksync-solc");

// module.exports = {
//   zksolc: {
//     version: "1.3.1",
//     compilerSource: "binary",
//     settings: {},
//   },
//   defaultNetwork: "zkSyncTestnet",

//   networks: {
//     zkSyncTestnet: {
//       url: "https://zksync2-testnet.zksync.dev",
//       ethNetwork: "goerli", // Can also be the RPC URL of the network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
//       zksync: true,
//     },
//   },
//   solidity: {
//     version: "0.8.17",
//   },
// };
