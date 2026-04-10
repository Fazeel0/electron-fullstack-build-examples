import express from 'express';
const router = express.Router();
import PomodoroSession from '../models/PomodoroSession.js';

// @desc    Get today's sessions
// @route   GET /api/pomodoro/today
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessions = await PomodoroSession.find({
      completedAt: { $gte: today }
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Log completed session
// @route   POST /api/pomodoro
router.post('/', async (req, res) => {
  const session = new PomodoroSession({
    duration: req.body.duration,
    type: req.body.type,
    label: req.body.label,
  });

  try {
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @desc    Weekly stats
// @route   GET /api/pomodoro/stats
router.get('/stats', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const stats = await PomodoroSession.aggregate([
      { $match: { completedAt: { $gte: sevenDaysAgo }, type: 'focus' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          totalMinutes: { $sum: "$duration" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
