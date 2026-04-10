this is how my app is opening again and again and not visible (hidden)

here is the electron main file

import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import AutoLaunch from 'auto-launch';

const **filename = fileURLToPath(import.meta.url);
const **dirname = path.dirname(\_\_filename);

let mainWindow;
let tray;
let serverProcess;

const isDev = !app.isPackaged;

// ─── Auto-launch on system startup ────────────────────────────────────────────
const devPulseAutoLauncher = new AutoLaunch({
name: 'DevPulse',
isHidden: false,
});
try {
const isEnabled = await devPulseAutoLauncher.isEnabled();
if (!isEnabled) devPulseAutoLauncher.enable();
} catch (err) {
console.warn('⚠️ AutoLaunch not supported:', err.message);
}

// ─── Start Express backend ─────────────────────────────────────────────────────
function startServer() {
const serverPath = isDev
? path.join(\_\_dirname, '..', 'server', 'index.js')
: path.join(process.resourcesPath, 'server', 'index.js');

console.log('⏳ Starting Express Server...');
serverProcess = fork(serverPath, [], {
execArgv: ['--experimental-vm-modules'],
env: {
...process.env,
PORT: '5000',
MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/devpulse',
},
silent: false,
});

serverProcess.on('error', (err) => console.error('❌ Server error:', err));
serverProcess.on('exit', (code) => console.log(`⚠️ Server exited with code ${code}`));

if (isDev) {
// In dev → wait for ready signal from server
serverProcess.on('message', (msg) => {
if (msg === 'ready') {
console.log('✅ Express Server is ON!');
createWindow();
createTray();
}
});
} else {
// In production → just wait 4 seconds and open window
// process.send() is unreliable in packaged Electron
console.log('⏳ Production mode — waiting 4s for server...');
setTimeout(() => {
console.log('✅ Opening window...');
createWindow();
createTray();
}, 4000);
}
}

// ─── Load with retry (dev only) ───────────────────────────────────────────────
async function loadWithRetry(win, url, retries = 10, delay = 1000) {
for (let i = 0; i < retries; i++) {
try {
await win.loadURL(url);
return;
} catch (err) {
console.log(`⏳ Waiting for Vite... attempt ${i + 1}`);
await new Promise(res => setTimeout(res, delay));
}
}
console.error('❌ Could not connect to Vite after retries');
}

// ─── Create main window ────────────────────────────────────────────────────────
async function createWindow() {
if (mainWindow) return; // Prevent creating multiple windows

mainWindow = new BrowserWindow({
width: 1200,
height: 800,
show: false, // ← hide until ready-to-show fires
minWidth: 960,
minHeight: 600,
resizable: true,
titleBarStyle: 'hiddenInset',
backgroundColor: '#0f172a',
webPreferences: {
nodeIntegration: false,
contextIsolation: true,
},
});

const startUrl = isDev
? 'http://localhost:5173'
: `file://${path.join(__dirname, '..', 'client', 'dist', 'index.html')}`;

// ← Show window only when fully loaded
mainWindow.once('ready-to-show', () => {
mainWindow.show();
mainWindow.focus();
});

if (isDev) {
await loadWithRetry(mainWindow, startUrl);
} else {
mainWindow.loadURL(startUrl);
}

if (isDev) {
mainWindow.webContents.openDevTools({ mode: 'detach' });
}

// Hide to tray instead of closing
mainWindow.on('close', (event) => {
if (!app.isQuitting) {
event.preventDefault();
mainWindow.hide();
}
});
}

// ─── System Tray ──────────────────────────────────────────────────────────────
function createTray() {
if (tray) return; // Prevent creating multiple trays

const iconPath = isDev
? path.join(\_\_dirname, '..', 'assets', 'icon.png')
: path.join(process.resourcesPath, 'assets', 'icon.png');

let icon;
try {
icon = nativeImage.createFromPath(iconPath);
if (icon.isEmpty()) icon = nativeImage.createEmpty();
} catch {
icon = nativeImage.createEmpty();
}

tray = new Tray(icon);

const contextMenu = Menu.buildFromTemplate([
{
label: '📊 Open DevPulse',
click: () => { mainWindow.show(); mainWindow.focus(); },
},
{ type: 'separator' },
{
label: 'Quit',
click: () => { app.isQuitting = true; app.quit(); },
},
]);

tray.setToolTip('DevPulse — Developer Daily Dashboard');
tray.setContextMenu(contextMenu);

tray.on('click', () => {
mainWindow.isVisible() ? mainWindow.hide() : (mainWindow.show(), mainWindow.focus());
});
}

// ─── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
startServer();

app.on('activate', () => {
if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
});

app.on('window-all-closed', () => {
if (process.platform === 'darwin') app.quit();
});

app.on('before-quit', () => {
app.isQuitting = true;
if (serverProcess) serverProcess.kill();
});
