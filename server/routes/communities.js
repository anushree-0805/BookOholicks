import express from 'express';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import CommunityMember from '../models/CommunityMember.js';
import User from '../models/User.js';
import { verifyToken } from '../config/firebase.js';
import { checkCommunityJoin } from '../services/rewardService.js';

const router = express.Router();

// Get all communities
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, search, filter = 'popular' } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { 'stats.memberCount': -1 };
    if (filter === 'trending') {
      sortOption = { 'stats.weeklyActivity': -1 };
    } else if (filter === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const communities = await Community.find(query)
      .sort(sortOption)
      .lean();

    // Check user membership
    const userId = req.user.uid;
    const userMemberships = await CommunityMember.find({ userId }).select('communityId');
    const memberCommunityIds = new Set(userMemberships.map(m => m.communityId.toString()));

    const communitiesWithMembership = communities.map(community => ({
      ...community,
      isMember: memberCommunityIds.has(community._id.toString())
    }));

    res.json(communitiesWithMembership);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error: error.message });
  }
});

// Get single community
router.get('/:communityId', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId).lean();
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    const userId = req.user.uid;
    const membership = await CommunityMember.findOne({
      communityId: req.params.communityId,
      userId
    });

    res.json({
      ...community,
      isMember: !!membership,
      userRole: membership?.role || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community', error: error.message });
  }
});

// Create community
router.post('/', verifyToken, async (req, res) => {
  try {
    const community = new Community({
      ...req.body,
      createdBy: req.user.uid,
      moderators: [req.user.uid],
      members: [{
        userId: req.user.uid,
        joinedAt: new Date(),
        reputation: 0
      }],
      stats: { memberCount: 1, postCount: 0, weeklyActivity: 0 }
    });

    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: 'Error creating community', error: error.message });
  }
});

// Join community
router.post('/:communityId/join', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const userId = req.user.uid;

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      communityId: req.params.communityId,
      userId
    });

    if (existingMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // Create community member record
    const member = new CommunityMember({
      communityId: req.params.communityId,
      userId,
      role: 'member'
    });
    await member.save();

    // Update community stats
    await Community.findByIdAndUpdate(req.params.communityId, {
      $inc: { 'stats.memberCount': 1 }
    });

    // Check community join reward (async, don't block response)
    checkCommunityJoin(userId, req.params.communityId).catch(err =>
      console.error('Community join reward check error:', err)
    );

    res.json({ message: 'Joined community successfully', member });
  } catch (error) {
    res.status(500).json({ message: 'Error joining community', error: error.message });
  }
});

// Leave community
router.post('/:communityId/leave', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const userId = req.user.uid;
    community.members = community.members.filter(m => m.userId !== userId);
    community.stats.memberCount = Math.max(0, community.stats.memberCount - 1);

    await community.save();
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Error leaving community', error: error.message });
  }
});

// Get community posts
router.get('/:communityId/posts', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ communityId: req.params.communityId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user details for each post
    const userIds = [...new Set(posts.map(p => p.userId))];
    const users = await User.find({ userId: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u.userId, u]));

    const postsWithUserData = posts.map(post => ({
      ...post,
      user: userMap[post.userId] || { name: 'Unknown User' }
    }));

    res.json(postsWithUserData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community posts', error: error.message });
  }
});

// Get community members
router.get('/:communityId/members', verifyToken, async (req, res) => {
  try {
    const { sort = 'recent' } = req.query;

    let sortOption = { joinedAt: -1 };
    if (sort === 'reputation') {
      sortOption = { reputation: -1 };
    } else if (sort === 'contributions') {
      sortOption = { 'totalContributions.posts': -1 };
    }

    const members = await CommunityMember.find({ communityId: req.params.communityId })
      .sort(sortOption)
      .lean();

    // Fetch user details
    const userIds = members.map(m => m.userId);
    const users = await User.find({ userId: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u.userId, u]));

    const membersWithUserData = members.map(member => ({
      ...member,
      user: userMap[member.userId] || { name: 'Unknown User' }
    }));

    res.json(membersWithUserData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
});

// Get user's communities
router.get('/user/my-communities', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const memberships = await CommunityMember.find({ userId }).populate('communityId');

    const communities = memberships.map(m => m.communityId);
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user communities', error: error.message });
  }
});

// Get suggested communities (not joined yet)
router.get('/suggested/for-you', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get communities user is already in
    const userMemberships = await CommunityMember.find({ userId }).select('communityId');
    const joinedIds = userMemberships.map(m => m.communityId);

    // Get communities user hasn't joined, sorted by popularity
    const suggested = await Community.find({ _id: { $nin: joinedIds } })
      .sort({ 'stats.memberCount': -1 })
      .limit(10)
      .lean();

    res.json(suggested);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggested communities', error: error.message });
  }
});

// Get weekly leaderboard for community
router.get('/:communityId/leaderboard', verifyToken, async (req, res) => {
  try {
    const topContributors = await CommunityMember.find({ communityId: req.params.communityId })
      .sort({
        'weeklyContributions.posts': -1,
        'weeklyContributions.comments': -1,
        'weeklyContributions.likes': -1
      })
      .limit(10)
      .lean();

    // Fetch user details
    const userIds = topContributors.map(m => m.userId);
    const users = await User.find({ userId: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u.userId, u]));

    const leaderboard = topContributors.map(contributor => ({
      userId: contributor.userId,
      user: userMap[contributor.userId] || { name: 'Unknown User' },
      weeklyContributions: contributor.weeklyContributions,
      reputation: contributor.reputation
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

export default router;
