import express from 'express';
const router = express.Router();
import axios from 'axios';

// @desc    Get weather for a city
// @route   GET /api/weather?city=name
router.get('/', async (req, res) => {
  // OpenWeather API key should be in .env
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const city = req.query.city || 'London';
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

export default router;
