import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // This fixes the stack too deep error!
    },
  },
  networks: {
    u2uTestnet: {
      url: "https://rpc-nebulas-testnet.uniultra.xyz",
      chainId: 2484,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000, // 2 minutes for transaction submission
      confirmations: 1, // Wait for 1 confirmation
    },
    u2uMainnet: {
      url: "https://rpc-mainnet.uniultra.xyz",
      chainId: 39,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};
