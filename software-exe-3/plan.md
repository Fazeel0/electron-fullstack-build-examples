Project Name: DevPulse — Developer Daily Dashboard
Type: Desktop Application (.exe)
Stack: React (Vite) + Express.js + MongoDB + Electron

=======================================================
PROJECT OVERVIEW
=======================================================
Build a desktop productivity app for developers that
serves as a single morning dashboard. It should launch
on system startup and show everything a developer needs
to start their day — GitHub activity, tasks, a focus
timer, notes, and weather.

=======================================================
TECH STACK
=======================================================
Frontend  : React (Vite) + TailwindCSS
Backend   : Node.js + Express.js
Database  : MongoDB + Mongoose
Desktop   : Electron
HTTP      : Axios
Charts    : Recharts
Icons     : Lucide React
Auth      : GitHub OAuth (via Express)

=======================================================
FOLDER STRUCTURE
=======================================================
devpulse/
├── electron/
│   └── main.js                  # Electron entry, loads Express + React
├── client/                      # React Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GithubWidget.jsx
│   │   │   ├── TodoWidget.jsx
│   │   │   ├── PomodoroWidget.jsx
│   │   │   ├── NotesWidget.jsx
│   │   │   ├── WeatherWidget.jsx
│   │   │   └── StreakWidget.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Settings.jsx
│   │   ├── api/                 # Axios API call functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/                      # Express backend
│   ├── models/
│   │   ├── Todo.js
│   │   ├── Note.js
│   │   ├── PomodoroSession.js
│   │   └── Streak.js
│   ├── routes/
│   │   ├── github.js            # GitHub API proxy routes
│   │   ├── todos.js
│   │   ├── notes.js
│   │   ├── pomodoro.js
│   │   └── streak.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   └── index.js                 # Express app entry
├── .env
└── package.json                 # Root — Electron scripts

=======================================================
MONGODB MODELS
=======================================================

Todo {
  text: String,
  priority: enum['high', 'medium', 'low'],
  completed: Boolean,
  date: Date (default today),
  createdAt: Date
}

Note {
  title: String,
  content: String,
  tags: [String],
  updatedAt: Date
}

PomodoroSession {
  duration: Number (minutes),
  type: enum['focus', 'break'],
  completedAt: Date,
  label: String (optional task label)
}

Streak {
  date: Date,
  coded: Boolean,
  commitCount: Number
}

=======================================================
EXPRESS API ROUTES
=======================================================

GitHub (proxy to avoid CORS + store token safely)
  GET /api/github/profile         → GitHub user info
  GET /api/github/activity        → Today's events
  GET /api/github/repos           → User repos list

Todos
  GET    /api/todos               → Get today's todos
  POST   /api/todos               → Create todo
  PATCH  /api/todos/:id           → Update (complete/edit)
  DELETE /api/todos/:id           → Delete todo

Notes
  GET    /api/notes               → Get all notes
  POST   /api/notes               → Create note
  PATCH  /api/notes/:id           → Edit note
  DELETE /api/notes/:id           → Delete note

Pomodoro
  GET    /api/pomodoro/today      → Today's sessions
  POST   /api/pomodoro            → Log completed session
  GET    /api/pomodoro/stats      → Weekly focus time stats

Streak
  GET    /api/streak              → Get last 30 days streak
  POST   /api/streak/log          → Log today as coded

Weather
  GET    /api/weather?city=name   → Proxy to OpenWeatherMap API

=======================================================
REACT WIDGETS — BEHAVIOR
=======================================================

1. GithubWidget
   - Show avatar, username, today's commit count
   - List last 5 events (push, PR, issue)
   - Green dot if committed today

2. TodoWidget
   - Show today's todos only
   - Add todo with priority (High/Medium/Low)
   - Check to complete, strike-through animation
   - Auto-clears completed todos at midnight

3. PomodoroWidget
   - 25 min focus / 5 min break timer
   - Start, Pause, Reset controls
   - On complete → POST session to backend
   - Show total focus hours today

4. NotesWidget
   - Quick scratchpad, auto-save on type (debounced 1s)
   - Search notes by keyword
   - Tag notes (e.g. #idea #bug #meeting)

5. WeatherWidget
   - Show city, temp, condition icon
   - City set in Settings page
   - Uses OpenWeatherMap free API

6. StreakWidget
   - Show last 30 days as GitHub-style grid
   - Green = coded, Grey = no commit
   - Current streak count displayed

=======================================================
SETTINGS PAGE
=======================================================
- GitHub Personal Access Token input (saved to .env / db)
- City name for weather
- Work hours start time (for daily reset)
- Pomodoro focus/break duration customization
- Theme toggle (Dark / Light)

=======================================================
ELECTRON SETUP
=======================================================
- main.js starts Express server as child process
- Loads React build in BrowserWindow
- App hides to system tray on close (does not quit)
- Tray icon with options: Open, Quit
- Auto-launch on system startup using
  'electron-auto-launch' package
- Window size: 1200x800, resizable

=======================================================
ENV VARIABLES (.env)
=======================================================
MONGO_URI=mongodb://localhost:27017/devpulse
GITHUB_TOKEN=your_github_personal_access_token
OPENWEATHER_API_KEY=your_openweather_api_key
PORT=5000

=======================================================
PACKAGE SCRIPTS
=======================================================
"scripts": {
  "dev:client": "vite (inside client/)",
  "dev:server": "nodemon server/index.js",
  "dev:electron": "electron electron/main.js",
  "build:client": "vite build",
  "build": "electron-builder --win",
  "start": "node server/index.js"
}

=======================================================
BUILD TO EXE
=======================================================
Use electron-builder to package:
- Target: nsis (Windows installer)
- Bundle: React build + Express server + Node.js
- Output: dist/DevPulse-Setup.exe

electron-builder config in package.json:
{
  "build": {
    "appId": "com.devpulse.app",
    "productName": "DevPulse",
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "files": [
      "electron/**",
      "client/dist/**",
      "server/**",
      "node_modules/**"
    ],
    "extraResources": [
      { "from": ".env", "to": ".env" }
    ]
  }
}

=======================================================
DEVELOPMENT ORDER (follow this sequence)
=======================================================
Step 1 → Setup MongoDB + Express + all routes + models
Step 2 → Test all APIs via Postman
Step 3 → Build React layout — Dashboard grid with widgets
Step 4 → Build each widget one by one, connect to API
Step 5 → Settings page
Step 6 → Electron wrapper — load app, tray, auto-launch
Step 7 → electron-builder → generate .exe
Step 8 → Test installer on Windows

=======================================================
IMPORTANT NOTES FOR AI AGENT
=======================================================
- Do NOT use Create React App. Use Vite only.
- Use functional components and hooks only. No class components.
- Use TailwindCSS for all styling. No inline styles.
- All API calls go through Express — never call GitHub
  or OpenWeather directly from React (CORS + key safety).
- MongoDB runs locally for dev. Use Atlas for production build.
- Keep all sensitive keys in .env — never hardcode.
- Each widget is a self-contained component with its own
  API hook (useGithub, useTodos, usePomodoro etc.)
- Use React Query or useEffect for data fetching.
- The Express server must start before Electron loads the window.