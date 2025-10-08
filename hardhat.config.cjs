require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // This fixes stack too deep errors
    },
  },
  networks: {
    u2uTestnet: {
      url: process.env.U2U_RPC_URL || "https://rpc-nebulas-testnet.uniultra.xyz",
      chainId: 2484,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    u2uMainnet: {
      url: "https://rpc-mainnet.uniultra.xyz",
      chainId: 39,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
