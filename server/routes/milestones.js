import express from 'express';
import { verifyToken } from '../config/firebase.js';
import { getUserMilestones, getPendingNFTRewards } from '../services/milestoneService.js';

const router = express.Router();

// Get user's milestones
router.get('/', verifyToken, async (req, res) => {
  try {
    const milestones = await getUserMilestones(req.user.uid);
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// Get pending NFT rewards
router.get('/pending-rewards', verifyToken, async (req, res) => {
  try {
    const pending = await getPendingNFTRewards(req.user.uid);
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending rewards', error: error.message });
  }
});

export default router;
