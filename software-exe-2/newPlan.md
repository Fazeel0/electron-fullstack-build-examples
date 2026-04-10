=======================================================
TASK: Fix DevPulse Server Setup
=======================================================

I have a MERN + Electron desktop app called DevPulse.
My project currently has NO package.json and NO 
node_modules inside the /server folder.

Fix the entire project setup so the server runs 
correctly when launched by Electron.

=======================================================
CURRENT PROJECT STRUCTURE
=======================================================

devpulse/
├── electron/
│   └── main.js          ← already written (do not change)
├── client/              ← React Vite app (already exists)
├── server/
│   └── index.js         ← needs to be created
├── assets/
│   └── icon.png
└── .env

=======================================================
TASK 1 — Create Root package.json
=======================================================

Create a single root package.json that includes ALL
dependencies for Electron + Express + React together.

Include these dependencies:
- electron
- electron-builder
- electron-auto-launch
- express
- mongoose
- cors
- dotenv
- axios
- nodemon (devDependency)

Include these scripts:
- "dev:client"    → cd client && npm run dev
- "dev:server"    → nodemon server/index.js
- "dev:electron"  → electron electron/main.js
- "build:client"  → cd client && npm run build
- "build"         → electron-builder --win
- "start"         → node server/index.js

Include electron-builder config inside package.json:
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
TASK 2 — Create server/index.js
=======================================================

Create a clean Express server with the following:

1. Load dotenv at the very top
2. Connect to MongoDB using MONGO_URI from .env
3. Use cors() and express.json() middleware
4. Mount these routes:
   - /api/todos      → routes/todos.js
   - /api/notes      → routes/notes.js
   - /api/pomodoro   → routes/pomodoro.js
   - /api/streak     → routes/streak.js
   - /api/github     → routes/github.js
   - /api/weather    → routes/weather.js
5. Use a global error handler middleware
6. Listen on PORT from .env (default 5000)
7. IMPORTANT: After app.listen() fires, add this:
   if (process.send) process.send('ready')
   This signals Electron that server is ready.

=======================================================
TASK 3 — Create All Route Files
=======================================================

Create these route files inside server/routes/

--- todos.js ---
GET    /api/todos         → fetch today's todos
POST   /api/todos         → create new todo
PATCH  /api/todos/:id     → update todo (complete/edit)
DELETE /api/todos/:id     → delete todo

--- notes.js ---
GET    /api/notes         → get all notes
POST   /api/notes         → create note
PATCH  /api/notes/:id     → update note
DELETE /api/notes/:id     → delete note

--- pomodoro.js ---
GET    /api/pomodoro/today   → get today's sessions
POST   /api/pomodoro         → log a completed session
GET    /api/pomodoro/stats   → last 7 days focus time

--- streak.js ---
GET    /api/streak           → last 30 days streak data
POST   /api/streak/log       → log today as coded

--- github.js ---
GET    /api/github/profile   → fetch GitHub user profile
GET    /api/github/activity  → fetch today's events
GET    /api/github/repos     → fetch user repos
(Use GITHUB_TOKEN from .env in Authorization header)
(Base URL: https://api.github.com)

--- weather.js ---
GET    /api/weather?city=    → fetch weather for city
(Use OPENWEATHER_API_KEY from .env)
(Base URL: https://api.openweathermap.org/data/2.5/weather)

=======================================================
TASK 4 — Create All Mongoose Models
=======================================================

Create these inside server/models/

--- Todo.js ---
{
  text: String (required),
  priority: enum ['high', 'medium', 'low'] default 'medium',
  completed: Boolean default false,
  date: Date default Date.now,
  createdAt: Date default Date.now
}

--- Note.js ---
{
  title: String,
  content: String (required),
  tags: [String],
  updatedAt: Date default Date.now
}

--- PomodoroSession.js ---
{
  duration: Number (minutes, required),
  type: enum ['focus', 'break'] default 'focus',
  completedAt: Date default Date.now,
  label: String
}

--- Streak.js ---
{
  date: Date (required, unique),
  coded: Boolean default true,
  commitCount: Number default 0
}

=======================================================
TASK 5 — Create config/db.js
=======================================================

Create server/config/db.js:
- Connect mongoose to MONGO_URI from .env
- Log success or error
- Export the connect function
- Call it from server/index.js before starting server

=======================================================
TASK 6 — Create middleware/errorHandler.js
=======================================================

Create server/middleware/errorHandler.js:
- A simple Express error middleware (4 params)
- Log the error stack
- Return JSON: { message: err.message }
- Status: err.status or 500

=======================================================
TASK 7 — Update electron/main.js
=======================================================

Make ONE change only in electron/main.js:

REMOVE this block:
  setTimeout(() => {
    createWindow();
    createTray();
  }, 1500);

REPLACE with:
  serverProcess.on('message', (msg) => {
    if (msg === 'ready') {
      createWindow();
      createTray();
    }
  });

This ensures the window only opens AFTER Express
and MongoDB are fully connected and ready.

=======================================================
TASK 8 — Create .env file
=======================================================

Create .env at root with:
  MONGO_URI=mongodb://localhost:27017/devpulse
  GITHUB_TOKEN=your_github_personal_access_token
  OPENWEATHER_API_KEY=your_openweather_api_key
  PORT=5000

=======================================================
FINAL FOLDER STRUCTURE AFTER ALL TASKS
=======================================================

devpulse/
├── electron/
│   └── main.js
├── client/
│   └── (React Vite - already exists)
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Todo.js
│   │   ├── Note.js
│   │   ├── PomodoroSession.js
│   │   └── Streak.js
│   ├── routes/
│   │   ├── todos.js
│   │   ├── notes.js
│   │   ├── pomodoro.js
│   │   ├── streak.js
│   │   ├── github.js
│   │   └── weather.js
│   └── index.js
├── assets/
│   └── icon.png
├── .env
└── package.json   ← single root package.json

=======================================================
IMPORTANT RULES FOR AI AGENT
=======================================================
- Do NOT touch electron/main.js except Task 7 change
- Do NOT touch anything inside /client folder
- Use CommonJS (require/module.exports) in server files
- Never hardcode API keys — always use process.env
- All routes must return proper JSON responses
- Run "npm install" at root after creating package.json
=======================================================