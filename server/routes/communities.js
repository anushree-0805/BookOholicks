import express from 'express';
import Community from '../models/Community.js';
import Post from '../models/Post.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Get all communities
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const communities = await Community.find(query)
      .sort({ 'stats.memberCount': -1 })
      .lean();

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error: error.message });
  }
});

// Get single community
router.get('/:communityId', verifyToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
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
    const alreadyMember = community.members.some(m => m.userId === userId);

    if (alreadyMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    community.members.push({ userId, joinedAt: new Date(), reputation: 0 });
    community.stats.memberCount += 1;

    await community.save();
    res.json(community);
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

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community posts', error: error.message });
  }
});

export default router;
