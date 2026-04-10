import express from 'express';
const router = express.Router();
import axios from 'axios';

// GitHub Personal Access Token should be in .env
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const githubConfig = {
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
  },
};

// @desc    Get GitHub profile
router.get('/profile', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user', githubConfig);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

// @desc    Get today's activity
router.get('/activity', async (req, res) => {
  try {
    const userRes = await axios.get('https://api.github.com/user', githubConfig);
    const username = userRes.data.login;
    const response = await axios.get(`https://api.github.com/users/${username}/events`, githubConfig);
    
    // Filter for today's events only
    const today = new Date().toISOString().split('T')[0];
    const events = response.data.filter(event => event.created_at.startsWith(today));
    
    res.json(events);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

export default router;
