import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

import connectDB from '../config/db.js';
import User from '../models/User.js';
import { initializeUserRewards } from '../services/rewardService.js';

const initializeAllRewards = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('👥 Fetching all users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\n📊 Initializing rewards for user: ${user.userId} (${user.email})`);
        const result = await initializeUserRewards(user.userId);

        if (result.success) {
          successCount++;
          console.log(`✅ Success for ${user.email}`);
        } else {
          errorCount++;
          console.log(`⚠️  Error for ${user.email}: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ Failed for ${user.email}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Summary:');
    console.log(`✅ Successfully initialized: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total users: ${users.length}`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

initializeAllRewards();
