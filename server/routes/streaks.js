import express from 'express';
import ReadingStreak from '../models/ReadingStreak.js';
import ReadingSession from '../models/ReadingSession.js';
import NFT from '../models/NFT.js';
import { verifyToken } from '../config/firebase.js';
import { checkReadingStreak } from '../services/rewardService.js';

const router = express.Router();

// Get streak data
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    let streak = await ReadingStreak.findOne({ userId: req.params.userId });

    if (!streak) {
      streak = new ReadingStreak({ userId: req.params.userId });
      await streak.save();
    }

    res.json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Log reading session and update streak
router.post('/log-session', verifyToken, async (req, res) => {
  try {
    const { userId, bookTitle, minutesRead, pagesRead, notes } = req.body;

    // Create reading session
    const session = new ReadingSession({
      userId,
      bookTitle,
      minutesRead,
      pagesRead,
      notes
    });
    await session.save();

    // Update streak
    let streak = await ReadingStreak.findOne({ userId });
    if (!streak) {
      streak = new ReadingStreak({ userId });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastRead = streak.lastReadDate ? new Date(streak.lastReadDate) : null;
    if (lastRead) {
      lastRead.setHours(0, 0, 0, 0);
    }

    const oneDayMs = 24 * 60 * 60 * 1000;
    const daysDiff = lastRead ? (today - lastRead) / oneDayMs : null;

    if (!lastRead || daysDiff === 1) {
      // Continue streak
      streak.currentStreak += 1;
      streak.totalDays += 1;
      if (!streak.streakStartDate) {
        streak.streakStartDate = today;
      }
    } else if (daysDiff === 0) {
      // Already read today, don't increment
    } else {
      // Streak broken
      streak.currentStreak = 1;
      streak.streakStartDate = today;
      streak.totalDays += 1;
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastReadDate = today;
    await streak.save();

    // Check reading streak rewards (async, don't block response)
    checkReadingStreak(userId, streak.currentStreak).catch(err =>
      console.error('Reading streak reward check error:', err)
    );

    res.status(201).json({ session, streak });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Claim streak reward
router.post('/:userId/claim-reward', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rewardDays } = req.body;

    const streak = await ReadingStreak.findOne({ userId });
    if (!streak || streak.currentStreak < rewardDays) {
      return res.status(400).json({ message: 'Streak requirement not met' });
    }

    // Check if reward already claimed
    const existingReward = await NFT.findOne({
      userId,
      name: `${rewardDays}-Day Reading Streak`,
      category: 'streak'
    });

    if (existingReward) {
      return res.status(400).json({ message: 'Reward already claimed' });
    }

    // Create NFT reward
    const rarityMap = {
      7: 'Common',
      10: 'Rare',
      15: 'Epic',
      30: 'Legendary',
      50: 'Mythic'
    };

    const nft = new NFT({
      userId,
      name: `${rewardDays}-Day Reading Streak`,
      image: 'flame',
      category: 'streak',
      rarity: rarityMap[rewardDays] || 'Common',
      description: `Earned by maintaining a ${rewardDays}-day reading streak`,
      benefits: [
        '10% discount on next book purchase',
        'Early access to new releases',
        'Exclusive streak badge'
      ]
    });

    await nft.save();
    res.status(201).json({ nft });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
