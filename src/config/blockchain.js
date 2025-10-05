// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  contractAddress: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240',
  rpcUrl: import.meta.env.VITE_U2U_RPC_URL || 'https://rpc-nebulas-testnet.uniultra.xyz',
  chainId: parseInt(import.meta.env.VITE_U2U_CHAIN_ID || '2484'),
  chainIdHex: import.meta.env.VITE_U2U_CHAIN_ID_HEX || '0x9b4',
  explorerUrl: import.meta.env.VITE_U2U_EXPLORER_URL || 'https://testnet.u2uscan.xyz',
  networkName: 'U2U Testnet',
  nativeCurrency: {
    name: 'U2U',
    symbol: 'U2U',
    decimals: 18
  }
};

// NFT Contract ABI (essential functions)
export const NFT_CONTRACT_ABI = [
  // Read functions
  "function getTokensByOwner(address owner) view returns (uint256[])",
  "function getMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint8 category, uint8 rarity, uint8 rewardType, string brand, bool redeemed, uint256 dateEarned, uint256 redeemedAt, string[] benefits))",
  "function getBenefits(uint256 tokenId) view returns (string[])",
  "function hasReward(uint8 rewardType, address user) view returns (bool)",
  "function getUnredeemedTokens(address owner) view returns (uint256[])",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",

  // Write functions
  "function redeemNFT(uint256 tokenId)",

  // Events
  "event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 rewardType, uint8 rarity, string name)",
  "event NFTRedeemed(address indexed owner, uint256 indexed tokenId, uint256 redeemedAt)"
];

// Enum mappings (must match smart contract)
export const CATEGORY = {
  0: 'streak',
  1: 'genre',
  2: 'reward',
  3: 'event',
  4: 'achievement',
  5: 'community'
};

export const RARITY = {
  0: 'Common',
  1: 'Rare',
  2: 'Epic',
  3: 'Legendary',
  4: 'Mythic'
};

export const REWARD_TYPE = {
  0: 'active_poster',
  1: 'popular_opinion',
  2: 'explorer',
  3: 'event_participant',
  4: 'event_organizer',
  5: 'streak_bronze',
  6: 'streak_silver',
  7: 'streak_gold',
  8: 'streak_platinum'
};

// NFT Emoji mappings
export const NFT_EMOJIS = {
  'active_poster': '✍️',
  'popular_opinion': '⭐',
  'explorer': '🧭',
  'event_participant': '🎫',
  'event_organizer': '🎪',
  'streak_bronze': '🥉',
  'streak_silver': '🥈',
  'streak_gold': '🥇',
  'streak_platinum': '💎'
};
