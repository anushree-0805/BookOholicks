import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string name, string description, uint8 category, uint8 rarity, uint8 rewardType, string brand, string[] benefits, string tokenURI) returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

async function testMint() {
  console.log('🧪 Testing NFT Minting...\n');

  const testWallet = process.argv[2];

  if (!testWallet) {
    console.log('❌ Please provide a wallet address');
    console.log('Usage: node scripts/testMint.js YOUR_WALLET_ADDRESS');
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.U2U_RPC_URL || 'https://rpc-nebulas-testnet.uniultra.xyz'
    );

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = process.env.NFT_CONTRACT_ADDRESS || '0xee2cbd200295a7ade7b0cd1ab7c7980fcdf9d240';
    const contract = new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, wallet);

    console.log('📍 Contract:', contractAddress);
    console.log('💰 Minting to:', testWallet);
    console.log('🔑 From:', wallet.address);
    console.log('');

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💵 Wallet Balance:', ethers.formatEther(balance), 'U2U');

    if (balance === 0n) {
      console.log('❌ ERROR: No U2U tokens in wallet!');
      console.log('💡 Get testnet tokens from faucet');
      return;
    }

    // Get current supply
    const supplyBefore = await contract.totalSupply();
    console.log('📊 NFTs before:', supplyBefore.toString());
    console.log('');

    console.log('🔨 Minting test NFT...');

    const tx = await contract.mintNFT(
      testWallet,
      "Test Explorer NFT",
      "Earned by joining your first community",
      5, // community
      0, // Common
      2, // explorer
      "Bookoholics",
      ["Community badge", "Early access to new communities"],
      ""
    );

    console.log('⏳ Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();

    console.log('✅ Transaction confirmed!');
    console.log('📦 Block:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());
    console.log('');

    const supplyAfter = await contract.totalSupply();
    console.log('📊 NFTs after:', supplyAfter.toString());
    console.log('');

    console.log('🎉 SUCCESS! NFT Minted!');
    console.log('🔗 View on explorer:');
    console.log(`https://testnet.u2uscan.xyz/tx/${tx.hash}`);

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Solution: Get U2U testnet tokens');
    } else if (error.message.includes('already earned')) {
      console.log('\n💡 This wallet already has this reward type');
    }
  }
}

testMint();
