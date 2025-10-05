import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const NFT_CONTRACT_ABI = [
  "function getTokensByOwner(address owner) view returns (uint256[])",
  "function getMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint8 category, uint8 rarity, uint8 rewardType, string brand, bool redeemed, uint256 dateEarned, uint256 redeemedAt, string[] benefits))"
];

const CATEGORY = ['streak', 'genre', 'reward', 'event', 'achievement', 'community'];
const RARITY = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const REWARD_TYPE = ['active_poster', 'popular_opinion', 'explorer', 'event_participant', 'event_organizer', 'streak_bronze', 'streak_silver', 'streak_gold', 'streak_platinum'];
const EMOJIS = ['✍️', '⭐', '🧭', '🎫', '🎪', '🥉', '🥈', '🥇', '💎'];

async function checkUserNFTs(walletAddress) {
  if (!walletAddress) {
    console.log('❌ Please provide a wallet address');
    console.log('Usage: node scripts/checkUserNFTs.js YOUR_WALLET_ADDRESS');
    return;
  }

  console.log('🔍 Checking NFTs for wallet:', walletAddress);
  console.log('');

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.U2U_RPC_URL || 'https://rpc-nebulas-testnet.uniultra.xyz'
    );

    const contractAddress = process.env.NFT_CONTRACT_ADDRESS || '0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240';
    const contract = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, provider);

    // Get user's token IDs
    const tokenIds = await contract.getTokensByOwner(walletAddress);

    if (tokenIds.length === 0) {
      console.log('❌ This wallet has NO NFTs yet\n');
      console.log('💡 To get NFTs:');
      console.log('  1. Connect this wallet in the app');
      console.log('  2. Earn rewards (join community, read books, etc.)');
      console.log('  3. NFTs will be automatically minted');
      return;
    }

    console.log(`✅ Found ${tokenIds.length} NFT(s)!\n`);

    for (const tokenId of tokenIds) {
      const metadata = await contract.getMetadata(tokenId);

      console.log('═══════════════════════════════════════');
      console.log(`${EMOJIS[metadata.rewardType]} NFT #${tokenId}`);
      console.log('═══════════════════════════════════════');
      console.log(`Name: ${metadata.name}`);
      console.log(`Description: ${metadata.description}`);
      console.log(`Category: ${CATEGORY[metadata.category]}`);
      console.log(`Rarity: ${RARITY[metadata.rarity]}`);
      console.log(`Type: ${REWARD_TYPE[metadata.rewardType]}`);
      console.log(`Brand: ${metadata.brand}`);
      console.log(`Redeemed: ${metadata.redeemed ? '✓ Yes' : '✗ No'}`);
      console.log(`Date Earned: ${new Date(Number(metadata.dateEarned) * 1000).toLocaleString()}`);

      if (metadata.benefits.length > 0) {
        console.log('Benefits:');
        metadata.benefits.forEach((benefit, i) => {
          console.log(`  ${i + 1}. ${benefit}`);
        });
      }
      console.log('');
    }

    console.log('🔗 View on Explorer:');
    console.log(`https://testnet.u2uscan.xyz/address/${walletAddress}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run with wallet address from command line
const walletAddress = process.argv[2];
checkUserNFTs(walletAddress);
