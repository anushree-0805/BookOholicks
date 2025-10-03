import express from 'express';
import ReadingSession from '../models/ReadingSession.js';
import { verifyToken } from '../config/firebase.js';

const router = express.Router();

// Get user's reading sessions
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sessions = await ReadingSession.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(limit);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weekly stats
router.get('/:userId/weekly-stats', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await ReadingSession.find({
      userId,
      date: { $gte: weekAgo }
    });

    // Group by day
    const weeklyData = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    sessions.forEach(session => {
      const dayName = days[new Date(session.date).getDay()];
      if (!weeklyData[dayName]) {
        weeklyData[dayName] = { day: dayName, read: true, minutes: 0, pages: 0 };
      }
      weeklyData[dayName].minutes += session.minutesRead;
      weeklyData[dayName].pages += session.pagesRead;
    });

    const result = days.map(day => weeklyData[day] || { day, read: false, minutes: 0, pages: 0 });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
