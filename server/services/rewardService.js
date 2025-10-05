import Reward from '../models/Reward.js';
import NFT from '../models/NFT.js';
import User from '../models/User.js';
import blockchainService from './blockchainService.js';

// NFT definitions for different reward types
const NFT_DEFINITIONS = {
  active_poster: {
    name: 'Active Poster NFT',
    image: '✍️',
    category: 'achievement',
    rarity: 'Rare',
    description: 'Earned by posting regularly for 7 days in a row',
    benefits: [
      'Priority in community feeds',
      'Custom post badge',
      '5% discount on book merchandise'
    ]
  },
  popular_opinion: {
    name: 'Popular Opinion NFT',
    image: '⭐',
    category: 'achievement',
    rarity: 'Epic',
    description: 'Earned by receiving 100 likes on a single post',
    benefits: [
      'Featured post privilege',
      '10% discount on featured books',
      'Access to influencer community'
    ]
  },
  explorer: {
    name: 'Explorer NFT',
    image: '🧭',
    category: 'community',
    rarity: 'Common',
    description: 'Earned by joining your first community',
    benefits: [
      'Community badge',
      'Early access to new communities',
      'Welcome gift voucher'
    ]
  },
  event_participant: {
    name: 'Event Participant NFT',
    image: '🎫',
    category: 'event',
    rarity: 'Rare',
    description: 'Earned by attending a community event',
    benefits: [
      'Event attendance badge',
      'Priority event registration',
      '10% discount on event tickets'
    ]
  },
  event_organizer: {
    name: 'Event Organizer NFT',
    image: '🎪',
    category: 'event',
    rarity: 'Epic',
    description: 'Earned by organizing a successful community event',
    benefits: [
      'Organizer badge',
      'Free event hosting tools',
      'Featured organizer status'
    ]
  },
  streak_bronze: {
    name: 'Bronze Reading Badge',
    image: '🥉',
    category: 'streak',
    rarity: 'Common',
    description: 'Earned by maintaining a 7-day reading streak',
    benefits: [
      'Bronze streak badge',
      '5% discount on next book purchase',
      'Streak protection (1 day)'
    ]
  },
  streak_silver: {
    name: 'Silver Reading Badge',
    image: '🥈',
    category: 'streak',
    rarity: 'Rare',
    description: 'Earned by maintaining a 30-day reading streak',
    benefits: [
      'Silver streak badge',
      '10% discount on next book purchase',
      'Streak protection (2 days)',
      'Early access to new releases'
    ]
  },
  streak_gold: {
    name: 'Gold Reading Badge',
    image: '🥇',
    category: 'streak',
    rarity: 'Epic',
    description: 'Earned by maintaining a 90-day reading streak',
    benefits: [
      'Gold streak badge',
      '15% discount on next book purchase',
      'Streak protection (3 days)',
      'VIP book club access',
      'Author Q&A invitations'
    ]
  },
  streak_platinum: {
    name: 'Platinum Reading Badge',
    image: '💎',
    category: 'streak',
    rarity: 'Legendary',
    description: 'Earned by maintaining a 365-day reading streak',
    benefits: [
      'Platinum streak badge',
      '25% lifetime discount',
      'Streak protection (1 week)',
      'Exclusive author events',
      'Signed book collection access',
      'Custom profile theme'
    ]
  }
};

// Initialize reward tracking for a user
export const initializeUserRewards = async (userId) => {
  try {
    const rewardTypes = [
      { type: 'active_poster', trigger: 'posting_streak', target: 7 },
      { type: 'popular_opinion', trigger: 'post_likes', target: 100 },
      { type: 'explorer', trigger: 'community_join', target: 1 },
      { type: 'event_participant', trigger: 'event_attendance', target: 1 },
      { type: 'event_organizer', trigger: 'event_creation', target: 1 },
      { type: 'streak_bronze', trigger: 'reading_streak', target: 7 },
      { type: 'streak_silver', trigger: 'reading_streak', target: 30 },
      { type: 'streak_gold', trigger: 'reading_streak', target: 90 },
      { type: 'streak_platinum', trigger: 'reading_streak', target: 365 }
    ];

    const rewards = rewardTypes.map(r => ({
      userId,
      type: r.type,
      trigger: r.trigger,
      progress: { current: 0, target: r.target }
    }));

    await Reward.insertMany(rewards, { ordered: false });
    return { success: true };
  } catch (error) {
    if (error.code !== 11000) { // Ignore duplicate key errors
      console.error('Error initializing rewards:', error);
    }
    return { success: true }; // Return success even if rewards exist
  }
};

// Check and update reward progress
export const checkRewardProgress = async (userId, trigger, currentValue, metadata = {}) => {
  try {
    const rewards = await Reward.find({
      userId,
      trigger,
      earned: false
    });

    const earnedRewards = [];

    for (const reward of rewards) {
      reward.progress.current = currentValue;

      if (currentValue >= reward.progress.target) {
        // Mint NFT for this reward
        const nftDef = NFT_DEFINITIONS[reward.type];
        const nft = new NFT({
          userId,
          ...nftDef,
          brand: metadata.brand || 'Bookoholics'
        });
        await nft.save();

        // Mark reward as earned
        reward.earned = true;
        reward.earnedAt = new Date();
        reward.nftId = nft._id;
        reward.metadata = metadata;

        // Mint on blockchain if user has wallet
        const user = await User.findOne({ userId });
        if (user?.walletAddress) {
          try {
            const blockchainResult = await blockchainService.mintNFT(
              user.walletAddress,
              {
                name: nftDef.name,
                description: nftDef.description,
                category: nftDef.category,
                rarity: nftDef.rarity,
                rewardType: reward.type,
                brand: metadata.brand || 'Bookoholics',
                benefits: nftDef.benefits
              }
            );

            if (blockchainResult.success) {
              nft.tokenId = blockchainResult.tokenId;
              nft.transactionHash = blockchainResult.transactionHash;
              nft.blockNumber = blockchainResult.blockNumber;
              nft.onChain = true;
              await nft.save();
              console.log('✅ NFT minted on blockchain:', blockchainResult.tokenId);
            }
          } catch (error) {
            console.error('❌ Blockchain minting error:', error);
            // Continue even if blockchain minting fails
          }
        }

        earnedRewards.push({ reward, nft });
      }

      await reward.save();
    }

    return { success: true, earnedRewards };
  } catch (error) {
    console.error('Error checking reward progress:', error);
    return { success: false, error: error.message };
  }
};

// Get user's reward progress
export const getUserRewards = async (userId) => {
  try {
    const rewards = await Reward.find({ userId })
      .populate('nftId')
      .sort({ earned: -1, 'progress.current': -1 });

    return { success: true, rewards };
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return { success: false, error: error.message };
  }
};

// Specific trigger functions

export const checkPostingStreak = async (userId) => {
  // This will be called by a daily cron job or on post creation
  // Calculate consecutive posting days from Post collection
  const Post = (await import('../models/Post.js')).default;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentPosts = await Post.find({
    userId,
    createdAt: { $gte: sevenDaysAgo }
  }).sort({ createdAt: 1 });

  // Check if user has posted on consecutive days
  const postDates = new Set(recentPosts.map(p =>
    p.createdAt.toISOString().split('T')[0]
  ));

  let consecutiveDays = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    if (postDates.has(dateStr)) {
      consecutiveDays++;
    } else if (i > 0) {
      break;
    }
  }

  return checkRewardProgress(userId, 'posting_streak', consecutiveDays);
};

export const checkPostLikes = async (userId, postId, likeCount) => {
  return checkRewardProgress(userId, 'post_likes', likeCount, { postId });
};

export const checkCommunityJoin = async (userId, communityId) => {
  const CommunityMember = (await import('../models/CommunityMember.js')).default;
  const memberCount = await CommunityMember.countDocuments({ userId });
  return checkRewardProgress(userId, 'community_join', memberCount, { communityId });
};

export const checkEventAttendance = async (userId, eventId) => {
  // Count events user has attended
  const Event = (await import('../models/Event.js')).default;
  const attendedEvents = await Event.countDocuments({
    'attendees.userId': userId
  });
  return checkRewardProgress(userId, 'event_attendance', attendedEvents, { eventId });
};

export const checkEventCreation = async (userId, eventId) => {
  // Count events user has created
  const Event = (await import('../models/Event.js')).default;
  const createdEvents = await Event.countDocuments({ creatorId: userId });
  return checkRewardProgress(userId, 'event_creation', createdEvents, { eventId });
};

export const checkReadingStreak = async (userId, streakDays) => {
  return checkRewardProgress(userId, 'reading_streak', streakDays);
};
