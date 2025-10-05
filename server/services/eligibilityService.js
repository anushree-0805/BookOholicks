import CommunityMember from '../models/CommunityMember.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';
import ReadingStreak from '../models/ReadingStreak.js';
import CampaignClaim from '../models/CampaignClaim.js';

/**
 * Check if user is eligible for a campaign based on eligibility criteria
 */
export const checkEligibility = async (userId, campaign) => {
  try {
    // Check if user already claimed
    const existingClaim = await CampaignClaim.findOne({
      campaignId: campaign._id,
      userId
    });

    if (existingClaim) {
      return {
        eligible: false,
        reason: 'You have already claimed this campaign'
      };
    }

    // Check if NFTs are still available
    if (!campaign.unlimited && campaign.claimed >= campaign.totalSupply) {
      return {
        eligible: false,
        reason: 'No NFTs remaining'
      };
    }

    // If no eligibility criteria or type is 'open', everyone is eligible
    if (!campaign.eligibility || campaign.eligibility.type === 'open') {
      return {
        eligible: true,
        reason: 'Open to all users'
      };
    }

    // Check specific eligibility types
    switch (campaign.eligibility.type) {
      case 'community':
        return await checkCommunityEligibility(userId, campaign.eligibility.requirements);

      case 'engagement':
        return await checkEngagementEligibility(userId, campaign.eligibility.requirements);

      case 'streak':
        return await checkStreakEligibility(userId, campaign.eligibility.requirements);

      case 'event':
        return await checkEventEligibility(userId, campaign.eligibility.requirements);

      case 'purchase':
        return await checkPurchaseEligibility(userId, campaign.eligibility.requirements);

      case 'custom':
        // For custom eligibility, you can add your own logic
        return {
          eligible: true,
          reason: 'Custom eligibility - needs manual verification'
        };

      default:
        return {
          eligible: true,
          reason: 'No specific requirements'
        };
    }
  } catch (error) {
    console.error('Error checking eligibility:', error);
    return {
      eligible: false,
      reason: 'Error checking eligibility: ' + error.message
    };
  }
};

/**
 * Check community-based eligibility
 * Requirements: { communityId, minPosts }
 */
const checkCommunityEligibility = async (userId, requirements) => {
  try {
    const { communityId, minPosts = 0 } = requirements;

    // Check if user is member of the community
    const membership = await CommunityMember.findOne({
      userId,
      communityId
    });

    if (!membership) {
      return {
        eligible: false,
        reason: 'You must join the required community first'
      };
    }

    // Check if user has minimum posts in that community
    if (minPosts > 0) {
      const postCount = await Post.countDocuments({
        userId,
        communityId
      });

      if (postCount < minPosts) {
        return {
          eligible: false,
          reason: `You need ${minPosts} posts in the community. You have ${postCount}.`
        };
      }
    }

    return {
      eligible: true,
      reason: 'Community requirements met'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check engagement-based eligibility
 * Requirements: { minPostLikes, minComments, minPosts }
 */
const checkEngagementEligibility = async (userId, requirements) => {
  try {
    const { minPostLikes = 0, minComments = 0, minPosts = 0 } = requirements;

    // Check total posts
    if (minPosts > 0) {
      const postCount = await Post.countDocuments({ userId });
      if (postCount < minPosts) {
        return {
          eligible: false,
          reason: `You need ${minPosts} total posts. You have ${postCount}.`
        };
      }
    }

    // Check if user has a post with minimum likes
    if (minPostLikes > 0) {
      const popularPost = await Post.findOne({
        userId,
        likes: { $gte: minPostLikes }
      });

      if (!popularPost) {
        return {
          eligible: false,
          reason: `You need a post with at least ${minPostLikes} likes`
        };
      }
    }

    // Check total comments
    if (minComments > 0) {
      const totalComments = await Post.aggregate([
        { $match: { userId } },
        { $project: { commentCount: { $size: { $ifNull: ['$comments', []] } } } },
        { $group: { _id: null, total: { $sum: '$commentCount' } } }
      ]);

      const commentCount = totalComments[0]?.total || 0;
      if (commentCount < minComments) {
        return {
          eligible: false,
          reason: `You need ${minComments} total comments. You have ${commentCount}.`
        };
      }
    }

    return {
      eligible: true,
      reason: 'Engagement requirements met'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check streak-based eligibility
 * Requirements: { streakDays }
 */
const checkStreakEligibility = async (userId, requirements) => {
  try {
    const { streakDays = 0 } = requirements;

    const streak = await ReadingStreak.findOne({ userId });

    if (!streak || streak.currentStreak < streakDays) {
      return {
        eligible: false,
        reason: `You need a ${streakDays}-day reading streak. Current: ${streak?.currentStreak || 0} days.`
      };
    }

    return {
      eligible: true,
      reason: 'Streak requirement met'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check event-based eligibility
 * Requirements: { eventId, mustAttend }
 */
const checkEventEligibility = async (userId, requirements) => {
  try {
    const { eventId, mustAttend = true } = requirements;

    if (!mustAttend) {
      return { eligible: true, reason: 'No event attendance required' };
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return {
        eligible: false,
        reason: 'Event not found'
      };
    }

    // Check if user is in attendees list
    const isAttendee = event.attendees?.some(
      attendee => attendee.userId === userId
    );

    if (!isAttendee) {
      return {
        eligible: false,
        reason: 'You must attend the required event'
      };
    }

    return {
      eligible: true,
      reason: 'Event attendance confirmed'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Check purchase-based eligibility
 * Requirements: { minPurchaseAmount }
 */
const checkPurchaseEligibility = async (userId, requirements) => {
  try {
    const { minPurchaseAmount = 0 } = requirements;

    // TODO: Implement purchase tracking
    // For now, return true (you'll need to add a Purchase model)

    return {
      eligible: true,
      reason: 'Purchase verification not yet implemented'
    };
  } catch (error) {
    throw error;
  }
};

export default {
  checkEligibility
};
