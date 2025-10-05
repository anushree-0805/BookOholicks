import express from 'express';
import { verifyToken } from '../config/firebase.js';
import {
  initializeUserRewards,
  getUserRewards,
  checkPostingStreak,
  checkReadingStreak
} from '../services/rewardService.js';

const router = express.Router();

// Initialize rewards for a user
router.post('/initialize', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const result = await initializeUserRewards(userId);

    if (result.success) {
      res.json({ message: 'Rewards initialized successfully' });
    } else {
      res.status(500).json({ message: 'Error initializing rewards', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error initializing rewards', error: error.message });
  }
});

// Get user's reward progress
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const result = await getUserRewards(req.params.userId);

    if (result.success) {
      res.json(result.rewards);
    } else {
      res.status(500).json({ message: 'Error fetching rewards', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rewards', error: error.message });
  }
});

// Manually trigger posting streak check
router.post('/check-posting-streak', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const result = await checkPostingStreak(userId);

    res.json({
      message: 'Posting streak checked',
      earnedRewards: result.earnedRewards || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking posting streak', error: error.message });
  }
});

// Manually trigger reading streak check
router.post('/check-reading-streak', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { streakDays } = req.body;

    if (!streakDays) {
      return res.status(400).json({ message: 'streakDays is required' });
    }

    const result = await checkReadingStreak(userId, streakDays);

    res.json({
      message: 'Reading streak checked',
      earnedRewards: result.earnedRewards || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking reading streak', error: error.message });
  }
});

export default router;
