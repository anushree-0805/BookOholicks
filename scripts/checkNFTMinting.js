import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const NFT_CONTRACT_ABI = [
  "function totalSupply() view returns (uint256)",
  "function getTokensByOwner(address owner) view returns (uint256[])",
  "function getMetadata(uint256 tokenId) view returns (tuple(string name, string description, uint8 category, uint8 rarity, uint8 rewardType, string brand, bool redeemed, uint256 dateEarned, uint256 redeemedAt, string[] benefits))",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, uint8 rewardType, uint8 rarity, string name)"
];

const CATEGORY = ['streak', 'genre', 'reward', 'event', 'achievement', 'community'];
const RARITY = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const REWARD_TYPE = ['active_poster', 'popular_opinion', 'explorer', 'event_participant', 'event_organizer', 'streak_bronze', 'streak_silver', 'streak_gold', 'streak_platinum'];

async function checkNFTMinting() {
  console.log('🔍 Checking NFT Minting Status...\n');

  try {
    // Connect to U2U testnet
    const provider = new ethers.JsonRpcProvider(
      process.env.U2U_RPC_URL || 'https://rpc-nebulas-testnet.uniultra.xyz'
    );

    const contractAddress = process.env.NFT_CONTRACT_ADDRESS || '0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240';
    const contract = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, provider);

    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Network:', await provider.getNetwork());
    console.log('');

    // Get total supply
    const totalSupply = await contract.totalSupply();
    console.log('📊 Total NFTs Minted:', totalSupply.toString());
    console.log('');

    if (totalSupply > 0) {
      console.log('✅ NFTs ARE BEING MINTED!\n');

      // Get details of each NFT
      console.log('📋 NFT Details:\n');
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const metadata = await contract.getMetadata(i);
          const owner = await contract.ownerOf(i);

          console.log(`NFT #${i}:`);
          console.log(`  Name: ${metadata.name}`);
          console.log(`  Owner: ${owner}`);
          console.log(`  Category: ${CATEGORY[metadata.category]}`);
          console.log(`  Rarity: ${RARITY[metadata.rarity]}`);
          console.log(`  Type: ${REWARD_TYPE[metadata.rewardType]}`);
          console.log(`  Brand: ${metadata.brand}`);
          console.log(`  Redeemed: ${metadata.redeemed}`);
          console.log(`  Date Earned: ${new Date(Number(metadata.dateEarned) * 1000).toISOString()}`);
          console.log('');
        } catch (error) {
          console.log(`  Error fetching NFT #${i}:`, error.message);
        }
      }
    } else {
      console.log('❌ NO NFTs HAVE BEEN MINTED YET\n');
      console.log('💡 Tips to trigger minting:');
      console.log('  1. Connect wallet in the app (Dashboard → NFT Collection)');
      console.log('  2. Earn a reward (join community, log reading, etc.)');
      console.log('  3. Check server logs for minting errors');
      console.log('  4. Ensure wallet has U2U testnet tokens');
    }

    // Get recent mint events
    console.log('📜 Recent Mint Events:\n');
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - 1000); // Last ~1000 blocks

    const filter = contract.filters.NFTMinted();
    const events = await contract.queryFilter(filter, fromBlock, latestBlock);

    if (events.length > 0) {
      console.log(`Found ${events.length} mint events:\n`);
      events.forEach((event, index) => {
        console.log(`Event #${index + 1}:`);
        console.log(`  To: ${event.args.to}`);
        console.log(`  Token ID: ${event.args.tokenId}`);
        console.log(`  Name: ${event.args.name}`);
        console.log(`  Block: ${event.blockNumber}`);
        console.log(`  TX: ${event.transactionHash}`);
        console.log('');
      });
    } else {
      console.log('No mint events found in recent blocks');
    }

  } catch (error) {
    console.error('❌ Error checking NFT minting:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check if contract address is correct');
    console.log('  2. Verify U2U RPC URL is accessible');
    console.log('  3. Ensure .env file is configured');
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkNFTMinting();
}

export default checkNFTMinting;
