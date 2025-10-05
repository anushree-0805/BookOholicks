import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// NFT Contract ABI (essential functions only)
const NFT_CONTRACT_ABI = [
  // Minting (achievement-based)
  "function mintNFT(address to, string name, string description, uint8 category, uint8 rarity, uint8 rewardType, string brand, string[] benefits, string tokenURI) returns (uint256)",
  "function batchMintNFT(address[] recipients, string[] names, string[] descriptions, uint8[] categories, uint8[] rarities, uint8[] rewardTypes, string brand, string[] benefits)",

  // Phygital campaign minting
  "function mintToEscrow(address escrowWallet, string name, string description, uint8 category, uint8 rarity, string brand, string[] benefits, string tokenURI) returns (uint256)",
  "function batchMintToEscrow(address escrowWallet, uint256 quantity, string name, string description, uint8 category, uint8 rarity, string brand, string[] benefits, string tokenURI) returns (uint256[])",

  // Transfer functions
  "function transferFromEscrow(address from, address to, uint256 tokenId)",
  "function batchTransferFromEscrow(address from, address[] recipients, uint256[] tokenIds)",

  // Queries
  "function getTokensByOwner(address owner) view returns (uint256[])",
  "function getMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint8 category, uint8 rarity, uint8 rewardType, string brand, bool redeemed, uint256 dateEarned, uint256 redeemedAt, string[] benefits))",
  "function getBenefits(uint256 tokenId) view returns (string[])",
  "function hasReward(uint8 rewardType, address user) view returns (bool)",
  "function getUnredeemedTokens(address owner) view returns (uint256[])",
  "function totalSupply() view returns (uint256)",

  // User actions
  "function redeemNFT(uint256 tokenId)",

  // Events
  "event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 rewardType, uint8 rarity, string name)",
  "event NFTRedeemed(address indexed owner, uint256 indexed tokenId, uint256 redeemedAt)"
];

// Enum mappings (must match Solidity contract)
const CATEGORY = {
  STREAK: 0,
  GENRE: 1,
  REWARD: 2,
  EVENT: 3,
  ACHIEVEMENT: 4,
  COMMUNITY: 5
};

const RARITY = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
  MYTHIC: 4
};

const REWARD_TYPE = {
  ACTIVE_POSTER: 0,
  POPULAR_OPINION: 1,
  EXPLORER: 2,
  EVENT_PARTICIPANT: 3,
  EVENT_ORGANIZER: 4,
  STREAK_BRONZE: 5,
  STREAK_SILVER: 6,
  STREAK_GOLD: 7,
  STREAK_PLATINUM: 8
};

// Reverse mappings for display
const CATEGORY_NAMES = Object.keys(CATEGORY);
const RARITY_NAMES = Object.keys(RARITY);
const REWARD_TYPE_NAMES = Object.keys(REWARD_TYPE);

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const rpcUrl = process.env.U2U_RPC_URL || 'https://rpc-nebulas-testnet.uniultra.xyz';
      const privateKey = process.env.PRIVATE_KEY;
      const contractAddress = process.env.NFT_CONTRACT_ADDRESS;

      if (!privateKey || !contractAddress) {
        console.warn('Blockchain service not configured. Set PRIVATE_KEY and NFT_CONTRACT_ADDRESS in .env');
        return;
      }

      // Connect to U2U testnet
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Create wallet
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Connect to contract
      this.contract = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, this.wallet);

      this.initialized = true;
      console.log('✅ Blockchain service initialized');
      console.log('📍 Contract address:', contractAddress);
      console.log('💰 Wallet address:', this.wallet.address);
    } catch (error) {
      console.error('❌ Error initializing blockchain service:', error);
    }
  }

  /**
   * Convert reward type string to enum value
   */
  getRewardTypeEnum(type) {
    const mapping = {
      'active_poster': REWARD_TYPE.ACTIVE_POSTER,
      'popular_opinion': REWARD_TYPE.POPULAR_OPINION,
      'explorer': REWARD_TYPE.EXPLORER,
      'event_participant': REWARD_TYPE.EVENT_PARTICIPANT,
      'event_organizer': REWARD_TYPE.EVENT_ORGANIZER,
      'streak_bronze': REWARD_TYPE.STREAK_BRONZE,
      'streak_silver': REWARD_TYPE.STREAK_SILVER,
      'streak_gold': REWARD_TYPE.STREAK_GOLD,
      'streak_platinum': REWARD_TYPE.STREAK_PLATINUM
    };
    return mapping[type] ?? REWARD_TYPE.ACTIVE_POSTER;
  }

  /**
   * Convert category string to enum value
   */
  getCategoryEnum(category) {
    const mapping = {
      'streak': CATEGORY.STREAK,
      'genre': CATEGORY.GENRE,
      'reward': CATEGORY.REWARD,
      'event': CATEGORY.EVENT,
      'achievement': CATEGORY.ACHIEVEMENT,
      'community': CATEGORY.COMMUNITY
    };
    return mapping[category] ?? CATEGORY.ACHIEVEMENT;
  }

  /**
   * Convert rarity string to enum value
   */
  getRarityEnum(rarity) {
    const mapping = {
      'Common': RARITY.COMMON,
      'Rare': RARITY.RARE,
      'Epic': RARITY.EPIC,
      'Legendary': RARITY.LEGENDARY,
      'Mythic': RARITY.MYTHIC
    };
    return mapping[rarity] ?? RARITY.COMMON;
  }

  /**
   * Mint an NFT on the blockchain
   */
  async mintNFT(userWalletAddress, nftData) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const { name, description, category, rarity, rewardType, brand, benefits } = nftData;

      const categoryEnum = this.getCategoryEnum(category);
      const rarityEnum = this.getRarityEnum(rarity);
      const rewardTypeEnum = this.getRewardTypeEnum(rewardType);

      console.log('🔨 Minting NFT:', {
        to: userWalletAddress,
        name,
        rewardType,
        rarity
      });

      const tx = await this.contract.mintNFT(
        userWalletAddress,
        name,
        description,
        categoryEnum,
        rarityEnum,
        rewardTypeEnum,
        brand || 'Bookoholics',
        benefits || [],
        '' // tokenURI (empty for on-chain metadata)
      );

      const receipt = await tx.wait();

      // Extract token ID from event logs
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'NFTMinted'
      );

      const tokenId = event ? event.args[1] : null;

      console.log('✅ NFT minted successfully. Token ID:', tokenId?.toString());

      return {
        success: true,
        tokenId: tokenId?.toString(),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's NFTs from blockchain
   */
  async getUserNFTs(userWalletAddress) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      return { success: false, error: 'Blockchain service not initialized' };
    }

    try {
      const tokenIds = await this.contract.getTokensByOwner(userWalletAddress);

      const nfts = [];
      for (const tokenId of tokenIds) {
        const metadata = await this.contract.getMetadata(tokenId);

        nfts.push({
          tokenId: tokenId.toString(),
          name: metadata.name,
          description: metadata.description,
          category: CATEGORY_NAMES[metadata.category]?.toLowerCase() || 'achievement',
          rarity: RARITY_NAMES[metadata.rarity] || 'Common',
          rewardType: REWARD_TYPE_NAMES[metadata.rewardType]?.toLowerCase() || 'active_poster',
          brand: metadata.brand,
          redeemed: metadata.redeemed,
          dateEarned: new Date(Number(metadata.dateEarned) * 1000).toISOString(),
          redeemedAt: metadata.redeemed
            ? new Date(Number(metadata.redeemedAt) * 1000).toISOString()
            : null,
          benefits: metadata.benefits
        });
      }

      return { success: true, nfts };
    } catch (error) {
      console.error('❌ Error fetching user NFTs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Redeem an NFT
   */
  async redeemNFT(tokenId, userWalletAddress) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      return { success: false, error: 'Blockchain service not initialized' };
    }

    try {
      console.log('🎁 Redeeming NFT:', tokenId);

      const tx = await this.contract.redeemNFT(tokenId);
      const receipt = await tx.wait();

      console.log('✅ NFT redeemed successfully');

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Error redeeming NFT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has a specific reward
   */
  async hasReward(rewardType, userWalletAddress) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      return false;
    }

    try {
      const rewardTypeEnum = this.getRewardTypeEnum(rewardType);
      const hasIt = await this.contract.hasReward(rewardTypeEnum, userWalletAddress);
      return hasIt;
    } catch (error) {
      console.error('❌ Error checking reward:', error);
      return false;
    }
  }

  /**
   * Batch pre-mint NFTs to brand's escrow wallet (for phygital campaigns)
   */
  async batchMintToEscrow(escrowWallet, quantity, nftData) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const { name, description, category, rarity, brand, benefits } = nftData;

      const categoryEnum = this.getCategoryEnum(category);
      const rarityEnum = this.getRarityEnum(rarity);

      console.log('🔨 Batch minting to escrow:', {
        escrowWallet,
        quantity,
        name
      });

      const tx = await this.contract.batchMintToEscrow(
        escrowWallet,
        quantity,
        name,
        description,
        categoryEnum,
        rarityEnum,
        brand,
        benefits || [],
        '' // tokenURI
      );

      const receipt = await tx.wait();

      // Extract token IDs from events
      const tokenIds = [];
      for (const log of receipt.logs) {
        if (log.fragment && log.fragment.name === 'NFTMinted') {
          tokenIds.push(log.args[1].toString());
        }
      }

      console.log('✅ Batch minted successfully. Token IDs:', tokenIds.length);

      return {
        success: true,
        tokenIds,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Error batch minting to escrow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Transfer NFT from escrow to user (for campaign claims)
   */
  async transferFromEscrow(escrowWallet, userWallet, tokenId) {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      console.log('📤 Transferring from escrow:', {
        from: escrowWallet,
        to: userWallet,
        tokenId
      });

      const tx = await this.contract.transferFromEscrow(
        escrowWallet,
        userWallet,
        tokenId
      );

      const receipt = await tx.wait();

      console.log('✅ NFT transferred successfully');

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Error transferring from escrow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.contract) {
      return { success: false, error: 'Blockchain service not initialized' };
    }

    try {
      const totalSupply = await this.contract.totalSupply();

      return {
        success: true,
        stats: {
          totalNFTsMinted: totalSupply.toString(),
          contractAddress: this.contract.target || this.contract.address
        }
      };
    } catch (error) {
      console.error('❌ Error fetching contract stats:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
