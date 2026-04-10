NOW — EXPLANATION (IMPORTANT PART)
🚀 APP STRUCTURE DURING BUILD
🔵 1. files
"files": [
"electron/**/*",
"client/dist/**/*",
"package.json"
]

👉 Goes inside:

app.asar
✔ Used for:
Electron main process
UI (React/Vite build)
app logic
🔵 2. extraResources
"extraResources": [
{ "from": ".env", "to": ".env" },
{ "from": "server", "to": "server" }
]

👉 Goes OUTSIDE app.asar:

resources/
├── server/
├── .env
✔ Used for:
backend server (must be real filesystem)
environment variables
fork() compatibility
🔵 3. asarUnpack
"asarUnpack": [
"server/**/*"
]

👉 Prevents server from being compressed into .asar

✔ Used for:
making Node server runnable
avoiding asar execution issues
ensuring native filesystem access
🔵 4. build.directories.output
"output": "dist"

👉 Where final .exe is generated

🔵 5. win
"win": {
"target": "nsis",
"icon": "assets/icon.ico"
}
✔ Used for:
Windows installer (.exe)
app icon
🔵 6. nsis

Controls installer behavior:

oneClick: false → user can choose install path
desktop shortcut
start menu shortcut
🔵 7. extraMetadata
"main": "electron/main.js"

👉 Forces Electron entry point during build

🧠 SIMPLE MENTAL MODEL
app.asar → frontend + electron UI
resources/server → backend (your API)
resources/.env → environment config
asarUnpack → ensures server runs safely
