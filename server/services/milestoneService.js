import Milestone from '../models/Milestone.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

// Milestone thresholds
const MILESTONES = {
  post_count: [10, 50, 100, 500, 1000],
  engagement_likes: [100, 500, 1000, 5000, 10000],
  engagement_comments: [50, 250, 500, 2000, 5000],
  streak_days: [7, 30, 100, 365],
  books_read: [10, 50, 100, 500]
};

// NFT Badge descriptions
const BADGE_DESCRIPTIONS = {
  post_count: {
    10: { name: 'Starter Storyteller', description: 'Posted 10 times on the platform' },
    50: { name: 'Active Contributor', description: 'Posted 50 times on the platform' },
    100: { name: 'Century Club', description: 'Posted 100 times on the platform' },
    500: { name: 'Content Master', description: 'Posted 500 times on the platform' },
    1000: { name: 'Legendary Creator', description: 'Posted 1000 times on the platform' }
  },
  engagement_likes: {
    100: { name: 'Popular Voice', description: 'Received 100 total likes' },
    500: { name: 'Community Favorite', description: 'Received 500 total likes' },
    1000: { name: 'Thousand Hearts', description: 'Received 1000 total likes' },
    5000: { name: 'Influencer', description: 'Received 5000 total likes' },
    10000: { name: 'Legend', description: 'Received 10000 total likes' }
  },
  engagement_comments: {
    50: { name: 'Conversation Starter', description: 'Received 50 total comments' },
    250: { name: 'Discussion Leader', description: 'Received 250 total comments' },
    500: { name: 'Community Connector', description: 'Received 500 total comments' },
    2000: { name: 'Engagement Master', description: 'Received 2000 total comments' },
    5000: { name: 'Discussion Champion', description: 'Received 5000 total comments' }
  }
};

/**
 * Check and award milestones for post count
 */
export const checkPostMilestone = async (userId) => {
  try {
    // Get total post count
    const postCount = await Post.countDocuments({ userId });

    // Check each milestone
    for (const milestone of MILESTONES.post_count) {
      if (postCount >= milestone) {
        await awardMilestone(userId, 'post_count', milestone);
      }
    }

    return { postCount, milestonesChecked: true };
  } catch (error) {
    console.error('Error checking post milestone:', error);
    return { error: error.message };
  }
};

/**
 * Check and award milestones for engagement (likes/comments)
 */
export const checkEngagementMilestone = async (userId) => {
  try {
    // Get all user's posts
    const posts = await Post.find({ userId });

    // Calculate total likes and comments
    const totalLikes = posts.reduce((sum, post) => sum + (post.stats?.likeCount || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.stats?.commentCount || 0), 0);

    // Check like milestones
    for (const milestone of MILESTONES.engagement_likes) {
      if (totalLikes >= milestone) {
        await awardMilestone(userId, 'engagement_likes', milestone);
      }
    }

    // Check comment milestones
    for (const milestone of MILESTONES.engagement_comments) {
      if (totalComments >= milestone) {
        await awardMilestone(userId, 'engagement_comments', milestone);
      }
    }

    return { totalLikes, totalComments, milestonesChecked: true };
  } catch (error) {
    console.error('Error checking engagement milestone:', error);
    return { error: error.message };
  }
};

/**
 * Award a milestone to a user
 */
const awardMilestone = async (userId, milestoneType, milestone) => {
  try {
    // Check if milestone already exists
    const existing = await Milestone.findOne({
      userId,
      milestoneType,
      milestone
    });

    if (existing && existing.achieved) {
      return { alreadyAwarded: true };
    }

    // Get badge details
    const badgeInfo = BADGE_DESCRIPTIONS[milestoneType]?.[milestone] || {
      name: `${milestoneType} - ${milestone}`,
      description: `Achieved ${milestone} ${milestoneType}`
    };

    // Create or update milestone
    const milestoneDoc = await Milestone.findOneAndUpdate(
      { userId, milestoneType, milestone },
      {
        $set: {
          achieved: true,
          achievedAt: new Date(),
          metadata: {
            description: badgeInfo.description,
            badgeName: badgeInfo.name,
            rewardType: 'NFT_BADGE'
          }
        }
      },
      { upsert: true, new: true }
    );

    console.log(`✨ Milestone awarded: ${badgeInfo.name} to user ${userId}`);

    // TODO: Mint NFT badge (will be implemented with smart contract)
    // For now, we'll just mark it as ready for NFT minting
    // This will be integrated later with the smart contract module

    return {
      awarded: true,
      milestone: milestoneDoc,
      badgeInfo
    };
  } catch (error) {
    console.error('Error awarding milestone:', error);
    return { error: error.message };
  }
};

/**
 * Get all milestones for a user
 */
export const getUserMilestones = async (userId) => {
  try {
    const milestones = await Milestone.find({ userId })
      .sort({ achievedAt: -1 });

    return milestones;
  } catch (error) {
    console.error('Error fetching user milestones:', error);
    throw error;
  }
};

/**
 * Get pending NFT rewards (milestones achieved but NFT not minted yet)
 */
export const getPendingNFTRewards = async (userId) => {
  try {
    const pending = await Milestone.find({
      userId,
      achieved: true,
      nftAwarded: false
    });

    return pending;
  } catch (error) {
    console.error('Error fetching pending rewards:', error);
    throw error;
  }
};

export default {
  checkPostMilestone,
  checkEngagementMilestone,
  getUserMilestones,
  getPendingNFTRewards
};
