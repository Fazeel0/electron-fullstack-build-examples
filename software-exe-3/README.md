# DevPulse — Developer Daily Dashboard

A desktop productivity app for developers, built with React + Vite + Express + MongoDB + Electron.

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`

### 1. Clone and install dependencies

```bash
# Root dependencies (Electron, Express, etc.)
npm install

# Client dependencies (React, Tailwind, etc.)
cd client && npm install && cd ..
```

### 2. Configure environment variables

Copy the `.env` file and fill in your API keys:

```
MONGO_URI=mongodb://localhost:27017/devpulse
GITHUB_TOKEN=your_github_personal_access_token
OPENWEATHER_API_KEY=your_openweather_api_key
PORT=5000
```

> 🔑 Get your **GitHub PAT** at: https://github.com/settings/tokens  
> 🌤️ Get your **OpenWeather key** at: https://openweathermap.org/appid

### 3. Run in development mode

Open **3 separate terminals**:

```bash
# Terminal 1 — Express backend
npm run dev:server

# Terminal 2 — React Vite frontend
npm run dev:client

# Terminal 3 — Electron (after Vite is ready on port 5173)
npm run dev:electron
```

## 🏗️ Build `.exe` Installer

```bash
npm run build
```

The Windows installer will be output to `dist/DevPulse Setup.exe`.

## 📦 Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend  | Node.js + Express.js          |
| Database | MongoDB + Mongoose            |
| Desktop  | Electron 28                   |
| Charts   | Recharts                      |
| Icons    | Lucide React                  |

## 🧩 Widgets

- **GitHub Activity** — live profile, today's commits, recent events
- **Daily Tasks** — add/complete/delete todos, persisted to MongoDB
- **Focus Timer** — Pomodoro with SVG ring progress, auto session logging
- **Quick Notes** — debounced auto-save, tags, multi-note sidebar
- **Weather** — live city weather from OpenWeatherMap
- **Streak Grid** — 30-day coding streak visualization

## ⚙️ Settings

Click the ⚙️ icon to set your city, Pomodoro durations, and GitHub token hint.
