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
    u2uMainnet: {
      url: "https://rpc-mainnet.uniultra.xyz",
      chainId: 39,
      accounts: [], // Add your private key here: ["0x..."]
    },
  },
};
