import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Diagnostic script to check wallet address storage in database
 * Usage: node server/scripts/checkWalletStorage.js [userId]
 */

async function checkWalletStorage(userId = null) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    if (userId) {
      // Check specific user
      console.log(`🔍 Checking user: ${userId}\n`);
      const user = await User.findOne({ userId });

      if (!user) {
        console.log('❌ User NOT found in database');
        console.log('\n💡 Solution: User needs to complete profile setup or create a user record.\n');
        return;
      }

      console.log('✅ User found in database');
      console.log('\n📋 User Details:');
      console.log('─────────────────────────────────────────');
      console.log(`Name:          ${user.name}`);
      console.log(`Email:         ${user.email}`);
      console.log(`Account Type:  ${user.accountType}`);
      console.log(`Wallet:        ${user.walletAddress || '❌ NOT SET'}`);
      console.log(`Created:       ${user.createdAt}`);
      console.log('─────────────────────────────────────────\n');

      if (!user.walletAddress) {
        console.log('⚠️  ISSUE FOUND: Wallet address is NOT set!');
        console.log('\n💡 Solutions:');
        console.log('   1. User should update their profile with a wallet address');
        console.log('   2. Or run this to set it manually:');
        console.log(`      db.users.updateOne({userId: "${userId}"}, {$set: {walletAddress: "0xYourAddress"}})\n`);
      } else {
        // Validate wallet address format
        const walletRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!walletRegex.test(user.walletAddress)) {
          console.log('⚠️  ISSUE FOUND: Wallet address format is INVALID!');
          console.log(`   Current value: "${user.walletAddress}"`);
          console.log('   Expected format: 0x followed by 40 hexadecimal characters');
          console.log('\n💡 Solution: Update with a valid U2U wallet address\n');
        } else {
          console.log('✅ Wallet address is properly set and valid!\n');
          console.log('🎉 This user should be able to claim NFTs.\n');
        }
      }
    } else {
      // Check all users
      console.log('🔍 Checking all users in database\n');

      const allUsers = await User.find({});
      console.log(`📊 Total users: ${allUsers.length}\n`);

      if (allUsers.length === 0) {
        console.log('⚠️  No users found in database!\n');
        return;
      }

      const usersWithWallet = allUsers.filter(u => u.walletAddress);
      const usersWithoutWallet = allUsers.filter(u => !u.walletAddress);
      const usersWithInvalidWallet = allUsers.filter(u => {
        if (!u.walletAddress) return false;
        const walletRegex = /^0x[a-fA-F0-9]{40}$/;
        return !walletRegex.test(u.walletAddress);
      });

      console.log('📈 Statistics:');
      console.log('─────────────────────────────────────────');
      console.log(`Users with wallet:     ${usersWithWallet.length} (${((usersWithWallet.length / allUsers.length) * 100).toFixed(1)}%)`);
      console.log(`Users without wallet:  ${usersWithoutWallet.length} (${((usersWithoutWallet.length / allUsers.length) * 100).toFixed(1)}%)`);
      console.log(`Invalid wallet format: ${usersWithInvalidWallet.length}`);
      console.log('─────────────────────────────────────────\n');

      if (usersWithoutWallet.length > 0) {
        console.log('⚠️  Users WITHOUT wallet addresses:');
        console.log('─────────────────────────────────────────');
        usersWithoutWallet.forEach(u => {
          console.log(`  • ${u.name} (${u.email})`);
          console.log(`    UserID: ${u.userId}`);
          console.log(`    Account: ${u.accountType}`);
          console.log('');
        });
      }

      if (usersWithInvalidWallet.length > 0) {
        console.log('⚠️  Users with INVALID wallet addresses:');
        console.log('─────────────────────────────────────────');
        usersWithInvalidWallet.forEach(u => {
          console.log(`  • ${u.name} (${u.email})`);
          console.log(`    UserID: ${u.userId}`);
          console.log(`    Wallet: ${u.walletAddress}`);
          console.log('');
        });
      }

      if (usersWithWallet.length > 0 && usersWithInvalidWallet.length === 0) {
        console.log('✅ All users with wallet addresses have valid formats!\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Get userId from command line argument
const userId = process.argv[2];

checkWalletStorage(userId);
