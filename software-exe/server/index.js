import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import todosRoute from './routes/todos.js';
import notesRoute from './routes/notes.js';
import pomodoroRoute from './routes/pomodoro.js';
import streakRoute from './routes/streak.js';
import githubRoute from './routes/github.js';
import weatherRoute from './routes/weather.js';

// Load .env from the correct location (resources folder in production)
const resourcesPath = process.env.RESOURCES_PATH || process.cwd();
dotenv.config({ path: path.join(resourcesPath, '.env') });
console.log(`✅ Loaded .env from ${path.join(resourcesPath, '.env')}`);

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ========== API ROUTES (must come before static/fallback) ==========
app.use('/api/todos', todosRoute);
app.use('/api/notes', notesRoute);
app.use('/api/pomodoro', pomodoroRoute);
app.use('/api/streak', streakRoute);
app.use('/api/github', githubRoute);
app.use('/api/weather', weatherRoute);

// ========== PRODUCTION CLIENT STATIC FILES ==========
// In production, the built client is inside resources/app.asar/client/dist
// In development, you may want to disable this or point to a different folder.
const clientDistPath = path.join(resourcesPath, 'app.asar', 'client', 'dist');
app.use(express.static(clientDistPath));

// SPA fallback: any non-API request (including /) serves index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// ========== ERROR HANDLER (last) ==========
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Signal to Electron main process that the server is ready
  if (process.send) process.send('ready');
});