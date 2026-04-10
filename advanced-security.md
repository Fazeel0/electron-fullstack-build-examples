# Advanced Security Layers for Electron Apps

This guide covers additional security measures beyond Method 3 (bundling).

---

## Layer 1: Code Bundling (Already Covered)

Method 3 already provides basic protection by bundling server code into a single file.

---

## Layer 2: Code Obfuscation 🔥

Makes your code completely unreadable by renaming functions and variables.

### Install
```bash
npm install javascript-obfuscator --save-dev
```

### Add Script
```json
{
  "scripts": {
    "obfuscate:server": "javascript-obfuscator server/dist/server.cjs --output server/dist/server.obf.cjs --compact true --control-flow-flattening true --dead-code-injection true --string-array true"
  }
}
```

### Obfuscation Options Explained

| Option | Purpose |
|--------|---------|
| `--compact` | Minifies code, removes whitespace and newlines |
| `--control-flow-flattening` | Breaks logic readability by restructuring code flow |
| `--dead-code-injection` | Adds fake code to confuse reverse engineers |
| `--string-array` | Hides strings (like API keys, messages) in encoded array |

### Result

**Before Obfuscation:**
```javascript
function getTodos() { ... }
```

**After Obfuscation:**
```javascript
function _0x3fa21(){...}
```

### Update Build Script
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server-bundle && npm run obfuscate:server && electron-builder --win --x64"
  }
}
```

### Update Electron main.js
```javascript
const serverPath = isDev
  ? path.join(__dirname, '..', 'server', 'index.js')
  : path.join(process.resourcesPath, 'server', 'dist', 'server.obf.cjs');
```

---

## Layer 3: Integrity Check (Anti-Tampering)

Detects if users modified your server file.

### Add to Electron main.js
```javascript
import crypto from 'crypto';
import fs from 'fs';

function verifyIntegrity() {
  const serverPath = isDev
    ? path.join(__dirname, '..', 'server', 'index.js')
    : path.join(process.resourcesPath, 'server', 'dist', 'server.obf.cjs');
  
  const file = fs.readFileSync(serverPath);
  const hash = crypto.createHash('sha256').update(file).digest('hex');
  
  // Replace with your actual hash
  const expectedHash = 'YOUR_GENERATED_HASH_HERE';
  
  if (hash !== expectedHash) {
    console.error('Integrity check failed!');
    app.quit();
  }
}

verifyIntegrity();
```

### How to Generate Hash
```bash
# Run this to get your hash, then update the expectedHash above
node -e "const crypto=require('crypto'),fs=require('fs');console.log(crypto.createHash('sha256').update(fs.readFileSync('server/dist/server.obf.cjs')).digest('hex'));"
```

---

## Layer 4: Disable DevTools

Prevents users from opening developer tools in production.

### Add to Electron main.js
```javascript
if (!isDev) {
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });
  
  // Also disable right-click context menu
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key === 'I') {
      event.preventDefault();
    }
  });
}
```

---

## Combined package.json

```json
{
  "scripts": {
    "dev": "concurrently --kill-others-on-fail -n CLIENT,ELECTRON \"npm run dev:client\" \"npm run dev:electron\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "nodemon server/index.js",
    "dev:electron": "electron .",
    "build:client": "cd client && npm run build",
    "build:server-bundle": "esbuild server/index.js --bundle --platform=node --target=node18 --format=cjs --outfile=server/dist/server.cjs",
    "obfuscate:server": "javascript-obfuscator server/dist/server.cjs --output server/dist/server.obf.cjs --compact true --control-flow-flattening true",
    "build": "npm run build:client && npm run build:server-bundle && npm run obfuscate:server && electron-builder --win --x64"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1",
    "esbuild": "^0.21.5",
    "javascript-obfuscator": "^4.1.0",
    "nodemon": "^3.0.3"
  }
}
```

---

## Security Level Comparison

| Method | Protection Level |
|--------|-----------------|
| asar only | ❌ None |
| bundle only | 🟡 Low |
| bundle + obfuscate | 🟠 Medium |
| bundle + obfuscate + integrity | 🟠 Medium |
| all 4 layers | 🟢 High |
| native (C++/Rust) | 🟢 Highest |

---

## Important Reality Check

Even with all these layers, a determined attacker can still reverse-engineer your app. For truly sensitive logic (like DRM or critical algorithms), consider:

- Moving critical logic to a remote server
- Using native addons (C++/Rust)
- Using services like Enigma Protector for Electron

These security layers provide **strong protection** against casual users and make reverse-engineering significantly harder, but they are not unbreakable.

---

## Quick Start (Recommended Combination)

1. **Bundle** → esbuild (Method 3)
2. **Obfuscate** → javascript-obfuscator
3. **Integrity Check** → SHA256 hash verification
4. **Disable DevTools** → Block developer tools

This combination gives you industry-level protection for offline Electron apps.