import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;
let serverProcess;

const isDev = !app.isPackaged;

//
// ✅ SINGLE INSTANCE LOCK (fix multiple background processes)
//
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

//
// 🚀 Start backend
// this function breaks at first then works 
// function startServer() {
//   const serverPath = isDev
//     ? path.join(__dirname, '..', 'server', 'index.js')
//     : path.join(process.resourcesPath, 'server', 'index.js');

//   console.log('⏳ Starting backend:', serverPath);

//   serverProcess = fork(serverPath, [], {
//     env: {
//       ...process.env,
//       PORT: '5000',
//       RESOURCES_PATH: process.resourcesPath, // for packaged app to access .env file 
//     },
//   });

//   serverProcess.on('error', (err) => {
//     console.error('❌ Server error:', err);
//   });
// }


// this fun is to avoid delay in server start and crash app
let serverReady = false;

function startServer() {
  const serverPath = isDev
    ? path.join(__dirname, '..', 'server', 'index.js')
    : path.join(process.resourcesPath, 'server', 'index.js');

  serverProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      PORT: '5000',
      RESOURCES_PATH: process.resourcesPath,
    },
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Server error:', err);
  });

  serverProcess.on('message', (msg) => {
    if (msg === 'ready') {
      console.log('✅ Server is ready');
      serverReady = true;
      // Now create the window and tray
      if (mainWindow === undefined) {
        createWindow();
        createTray();
      }
    }
  });

  // Optional: log a warning after 10 seconds, but DO NOT force window creation
  setTimeout(() => {
    if (!serverReady) {
      console.warn('⚠️ Server still not ready after 10 seconds – waiting...');
      // You could show a "loading" indicator here, but don't open the window yet.
    }
  }, 10000);
}


//
// 🪟 Create window
//
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  // const startUrl = isDev
  //   ? 'http://localhost:5173'
  //   : `file://${path.join(__dirname, '../client/dist/index.html')}`;

  // Always load from the backend server (which serves the client)
  const startUrl = 'http://localhost:5000';  // Your Express server

  mainWindow.loadURL(startUrl).catch(() => mainWindow.show());
  // mainWindow.webContents.openDevTools();
}

//
// 📌 Tray
//
function createTray() {
  if (tray) return;

  const iconPath = path.join(process.resourcesPath, 'assets', 'icon.png');

  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);

  const menu = Menu.buildFromTemplate([
    {
      label: 'Open DevPulse',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('DevPulse');
  tray.setContextMenu(menu);

  tray.on('click', () => {
    mainWindow.isVisible()
      ? mainWindow.hide()
      : (mainWindow.show(), mainWindow.focus());
  });
}

//
// 🔁 Lifecycle
//
app.whenReady().then(() => {
  startServer();

  // Do NOT create window here – wait for 'ready' message

  // ⏳ small delay for backend (more stable than fixed 4s)
  // setTimeout(() => {
  //   createWindow();
  //   createTray();
  // }, 2000);
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (serverProcess) serverProcess.kill();
});