# Building Electron Apps with Embedded Server - Complete Guide

This guide explains three ways to package an Electron app with a backend server:

| Method | Server Location | Client Served By | Server Visibility |
|--------|---------------|------------------|-------------------|
| 1 | `resources/server/` (outside asar) | Express static | Visible (source code) |
| 2 | Inside `app.asar` | Vite dev server | Visible (in asar) |
| 3 | `resources/server/dist/` (outside asar) | Bundled | Hidden (bundled code) |

---

## Method 1: Server Outside ASAR (Source Code Visible) folder -> software-exe

Server code runs from the `resources` folder, outside the encrypted asar archive. The client build is served by Express.

### Project Structure
```
project/
├── .env
├── electron/
│   └── main.js
├── client/
│   └── dist/          (built frontend)
├── server/
│   └── index.js      (server source)
├── package.json
└── assets/
    └── icon.ico
```

### How It Works
- Server code is placed in `extraResources` → copied to `resources/server/`
- Client `dist/` is included in `files` → packed inside `app.asar`
- At runtime: Electron serves client from asar, server runs as separate process from resources
- User can view server source code in `resources/server/`

### Build Process
```bash
npm run build:client   # Build frontend (cd client && npm run build)
npm run build:server  # Install server deps (cd server && npm install --production)
npm run build         # Full build with electron-builder
```

### package.json Configuration

```json
{
  "name": "your-app",
  "main": "electron/main.js",
  "type": "module",
  "scripts": {
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm install --production",
    "build": "npm run build:client && npm run build:server && electron-builder --win --x64"
  },
  "build": {
    "appId": "com.yourapp.app",
    "productName": "YourApp",
    "directories": { "output": "dist" },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "files": [
      "electron/**/*",
      "client/dist/**/*",
      "package.json"
    ],
    "extraResources": [
      { "from": ".env", "to": ".env" },
      { "from": "server", "to": "server" }
    ],
    "extraMetadata": {
      "main": "electron/main.js"
    }
  }
}
```

### Key package.json Fields Explained

| Field | Purpose |
|-------|---------|
| `"main": "electron/main.js"` | Entry point for Electron |
| `"type": "module"` | Enable ES modules |
| `"files"` | Files to include in app.asar |
| `"extraResources"` | Files placed outside asar in resources folder |
| `"extraMetadata"` | Overrides package.json fields in built app |

---

## Method 2: Server Inside ASAR (Source Code Visible in Archive) folder -> software-exe-2

Server code is packed inside `app.asar` along with the client. The client runs on Vite's dev server.

### Project Structure
```
project/
├── .env
├── electron/
│   └── main.js
├── client/
│   └── dist/
├── server/
│   └── index.js
├── package.json
└── assets/
    └── icon.ico
```

### How It Works
- Server code is in `files` array → packed inside `app.asar`
- Client is also in `files` → packed inside `app.asar`
- At runtime: Vite serves client on its port, server runs from inside asar
- User can extract and view server source from asar

### Build Process
```bash
npm run build:client   # Build frontend
npm run build:server  # Install server deps
npm run build         # Full build
```

### package.json Configuration

```json
{
  "name": "your-app",
  "main": "electron/main.js",
  "type": "module",
  "scripts": {
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm install --production",
    "build": "npm run build:client && npm run build:server && electron-builder --win --x64"
  },
  "build": {
    "appId": "com.yourapp.app",
    "productName": "YourApp",
    "directories": { "output": "dist" },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "files": [
      "electron/**/*",
      "client/dist/**/*",
      "server/**/*",
      "package.json"
    ],
    "extraResources": [
      { "from": ".env", "to": ".env" }
    ],
    "extraMetadata": {
      "main": "electron/main.js"
    }
  }
}
```

### Key Difference from Method 1
- `server/**/*` is in `"files"` instead of `"extraResources"`
- This packs server inside `app.asar`

---

## Method 3: Server Bundled Outside ASAR (Source Code Hidden) folder -> software-exe-3

Server code is bundled with esbuild and placed outside `app.asar`. Source code is not visible.

### Project Structure
```
project/
├── .env
├── electron/
│   └── main.js
├── client/
│   └── dist/
├── server/
│   ├── index.js
│   └── dist/
│       └── server.cjs   (bundled output)
├── package.json
└── assets/
    └── icon.ico
```

### How It Works
- Server is bundled with esbuild into a single file
- Bundled server is placed in `extraResources` → `resources/server/dist/`
- Source code is not included - only the bundled output
- User cannot see the original server source

### Build Process
```bash
npm run build:client        # Build frontend
npm run build:server-bundle # Bundle server with esbuild
npm run build:server        # Install server deps (if needed)
npm run build               # Full build
```

### package.json Configuration

```json
{
  "name": "your-app",
  "main": "electron/main.js",
  "type": "module",
  "scripts": {
    "build:client": "cd client && npm run build",
    "build:server-bundle": "esbuild server/index.js --bundle --platform=node --target=node18 --format=cjs --outfile=server/dist/server.cjs",
    "build:server": "cd server && npm install --production",
    "build": "npm run build:client && npm run build:server-bundle && electron-builder --win --x64"
  },
  "devDependencies": {
    "esbuild": "^0.21.5"
  },
  "build": {
    "appId": "com.yourapp.app",
    "productName": "YourApp",
    "directories": { "output": "dist" },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "files": [
      "electron/**/*",
      "client/dist/**/*",
      "package.json"
    ],
    "extraResources": [
      { "from": ".env", "to": ".env" },
      { "from": "server/dist", "to": "server/dist" }
    ],
    "extraMetadata": {
      "main": "electron/main.js"
    }
  }
}
```

### esbuild Bundle Command Explained

| Flag | Purpose |
|------|---------|
| `--bundle` | Bundle all imports into single file |
| `--platform=node` | Target Node.js environment |
| `--target=node18` | Target Node.js 18+ |
| `--format=cjs` | CommonJS output format |
| `--outfile` | Output path |

---

## Common Scripts (Used in All Methods)

```json
{
  "scripts": {
    "dev": "concurrently --kill-others-on-fail -n CLIENT,ELECTRON \"npm run dev:client\" \"npm run dev:electron\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "nodemon server/index.js",
    "dev:electron": "electron .",
    "start": "node server/index.js"
  }
}
```

### Dev Scripts Explained

| Script | Purpose |
|--------|---------|
| `npm run dev` | Run client + Electron concurrently |
| `npm run dev:client` | Start Vite dev server |
| `npm run dev:server` | Start server with nodemon (auto-reload) |
| `npm run dev:electron` | Start Electron app |
| `npm run start` | Start server standalone |

---

## Required Dependencies

```json
{
  "devDependencies": {
    "concurrently": "^8.2.2",
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1",
    "nodemon": "^3.0.3"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.2",
    "auto-launch": "^5.0.6"
  }
}
```

### Dependency Purpose

| Package | Purpose |
|---------|---------|
| `electron` | Core framework |
| `electron-builder` | Build .exe installer |
| `concurrently` | Run multiple processes |
| `nodemon` | Auto-reload server |
| `express` | Node.js web server |
| `cors` | Enable CORS |
| `dotenv` | Load environment variables |
| `auto-launch` | Auto-start on login |

---

## Quick Comparison

| Aspect | Method 1 | Method 2 | Method 3 |
|--------|----------|---------|----------|
| Server location | `resources/server/` | Inside asar | `resources/server/dist/` |
| Server visible | Yes (in resources) | Yes (in asar) | No (bundled) |
| Client served by | Express | Vite | Express |
| Source protected | No | No | Yes |
| Harder to modify | No | Yes (extract) | Yes |
| Recommended for | Development | Testing | Production |

---

## Recommended: Method 3 (Server Bundled Outside ASAR)

This is the **recommended approach** for production applications. Here's why:

### 1. Source Code Protection
- Server code is bundled into a single file using esbuild
- Original source code (controllers, routes, models) is not included
- Users cannot read your business logic or see API implementations

### 2. Security
- No exposed source files in `resources/` folder
- Database credentials, API keys, and secrets remain protected
- Prevents users from modifying or tampering with server code

### 3. Performance
- Bundled code is optimized and minified
- Single file means faster loading
- No unnecessary files = smaller package size

### 4. Maintainability
- Server runs from outside asar - easy to update/replace
- Can still access the bundled file if needed for debugging
- Clean separation between source (for you) and bundle (for users)

### When to Use Method 3
- Commercial/proprietary applications
- Apps with sensitive business logic
- Any production deployment where code security matters
- When you want to protect API endpoints and database queries

---

## Next Steps: Advanced Security

For production apps requiring additional protection, see **[advanced-security.md](./advanced-security.md)** which covers:

- Code obfuscation with javascript-obfuscator
- Integrity check (anti-tampering)
- Disable devtools in production
- Combined security approach