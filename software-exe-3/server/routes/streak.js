import express from 'express';
const router = express.Router();
import Streak from '../models/Streak.js';

// @desc    Get last 30 days streak
// @route   GET /api/streak
router.get('/', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const streaks = await Streak.find({
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    res.json(streaks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Log today as coded
// @route   POST /api/streak/log
router.post('/log', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    let streak = await Streak.findOne({ date: today });
    if (streak) {
      streak.coded = true;
      streak.commitCount += 1;
    } else {
      streak = new Streak({
        date: today,
        coded: true,
        commitCount: 1
      });
    }
    const updatedStreak = await streak.save();
    res.json(updatedStreak);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
