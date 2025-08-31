# SmileSync Electron Desktop Application

This directory contains the Electron configuration and build setup for the SmileSync dental clinic management system, enabling cross-platform desktop application deployment.

## 🖥️ Desktop Application Overview

SmileSync's Electron integration transforms the web-based application into a native desktop experience, providing:

- **Native Desktop Experience**: Full-featured desktop application with native menus, shortcuts, and system integration
- **Cross-Platform Support**: Windows, macOS, and Linux compatibility
- **Offline Capabilities**: Local data storage and offline functionality
- **System Integration**: File system access, notifications, and system tray integration
- **Enhanced Security**: Sandboxed environment with controlled access to system resources
- **Auto-Updates**: Built-in update mechanism for seamless application updates

## 🏗️ Architecture

```
electron/
├── main.js              # Main Electron process
├── preload.js           # Preload script for secure IPC
├── package.json         # Electron-specific dependencies
├── icon.png             # Application icon
├── build/               # Build configuration
│   ├── icon.icns        # macOS icon
│   ├── icon.ico         # Windows icon
│   └── background.png   # DMG background (macOS)
└── dist/                # Built application packages
```

## 🛠️ Technology Stack

### Core Technologies
- **Electron**: 28.x - Cross-platform desktop framework
- **Node.js**: 20.x - JavaScript runtime
- **Chromium**: Latest - Web rendering engine

### Build Tools
- **electron-builder**: Application packaging and distribution
- **electron-updater**: Auto-update functionality
- **concurrently**: Parallel process management
- **wait-on**: Service dependency management

### Security Features
- **Context Isolation**: Secure communication between processes
- **Preload Scripts**: Safe API exposure to renderer
- **Content Security Policy**: XSS protection
- **Node Integration**: Disabled in renderer for security

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure Node.js 20+ is installed
node --version
npm --version

# Install dependencies
npm install
```

### Development Mode
```bash
# Start the Electron application in development
npm run electron:dev

# This will:
# 1. Start the React development server
# 2. Start the Express backend server
# 3. Launch Electron with hot reload
```

### Production Build
```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux

# Build for all platforms
npm run electron:build:all
```

## 📁 Main Process Configuration

### main.js
The main Electron process handles:

```javascript
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');

// Application configuration
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false // Show after ready-to-show
  });

  // Load application
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../app/build/index.html')}`;
  
  mainWindow.loadURL(startUrl);
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });
};
```

### Key Features
- **Window Management**: Responsive window sizing and state management
- **Security Configuration**: Context isolation and preload scripts
- **Development Tools**: Automatic DevTools in development mode
- **Icon Configuration**: Platform-specific application icons
- **Menu Integration**: Native application menus

## 🔒 Security Implementation

### Preload Script (preload.js)
Secure API exposure to the renderer process:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // System integration
  showNotification: (title, body) => 
    ipcRenderer.invoke('notification:show', { title, body }),
  
  // Application control
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  checkForUpdates: () => ipcRenderer.invoke('updater:checkForUpdates'),
  
  // Database operations (secure proxy)
  database: {
    query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
    backup: () => ipcRenderer.invoke('db:backup'),
    restore: (filePath) => ipcRenderer.invoke('db:restore', filePath)
  }
});
```

### Security Best Practices
- **No Node Integration**: Renderer process runs in sandboxed environment
- **Context Isolation**: Secure communication channel
- **CSP Headers**: Content Security Policy implementation
- **Secure Defaults**: Minimal privilege principle

## 📦 Build Configuration

### electron-builder Configuration
```json
{
  "build": {
    "appId": "com.smilesync.app",
    "productName": "SmileSync",
    "directories": {
      "output": "electron/dist"
    },
    "files": [
      "app/build/**/*",
      "backend/**/*",
      "electron/main.js",
      "electron/preload.js",
      "electron/package.json",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.medical",
      "icon": "electron/build/icon.icns",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "icon": "electron/build/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "icon": "electron/build/icon.png",
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        }
      ]
    },
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "smilesync"
    }
  }
}
```

### Build Targets
- **macOS**: DMG installer, ZIP archive (Intel & Apple Silicon)
- **Windows**: NSIS installer, Portable executable
- **Linux**: AppImage, Debian package

## 🔄 Auto-Update System

### Update Configuration
```javascript
// Auto-updater setup in main.js
const { autoUpdater } = require('electron-updater');

// Configure auto-updater
autoUpdater.checkForUpdatesAndNotify();

// Update event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});
```

### Update Distribution
- **GitHub Releases**: Automatic update distribution
- **Code Signing**: Signed releases for security
- **Delta Updates**: Efficient incremental updates

## 🗄️ Local Database Integration

### SQLite Configuration
```javascript
// Database path configuration
const { app } = require('electron');
const path = require('path');

const getDatabasePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'smilesync.db');
};

// Database initialization
const initializeDatabase = async () => {
  const dbPath = getDatabasePath();
  // Initialize Sequelize with local SQLite database
  // Copy schema and seed data if needed
};
```

### Data Management
- **Local Storage**: SQLite database in user data directory
- **Data Backup**: Export/import functionality
- **Data Sync**: Future cloud synchronization capability
- **Migration**: Database schema versioning

## 🎨 Application Branding

### Icon Requirements
- **macOS**: icon.icns (512x512, 256x256, 128x128, 64x64, 32x32, 16x16)
- **Windows**: icon.ico (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
- **Linux**: icon.png (512x512)

### Application Metadata
```json
{
  "name": "SmileSync",
  "productName": "SmileSync Dental Management",
  "description": "Comprehensive dental clinic management system",
  "version": "1.0.0",
  "author": "SmileSync Team",
  "homepage": "https://smilesync.com",
  "license": "MIT"
}
```

## 🧪 Testing

### Electron Testing
```bash
# Test Electron application
npm run test:electron

# Test with Spectron (E2E testing)
npm run test:e2e:electron
```

### Testing Strategy
- **Unit Tests**: Main process functionality
- **Integration Tests**: IPC communication
- **E2E Tests**: Complete application workflows
- **Security Tests**: Renderer isolation validation

## 📊 Performance Optimization

### Memory Management
- **Window Lifecycle**: Proper window creation/destruction
- **Resource Cleanup**: Event listener removal
- **Memory Monitoring**: Development memory profiling

### Startup Optimization
- **Lazy Loading**: Defer non-critical module loading
- **Preload Optimization**: Minimal preload script
- **Bundle Optimization**: Tree shaking and minification

## 🔧 Development Tools

### Debug Configuration
```bash
# Enable Electron debugging
export ELECTRON_ENABLE_LOGGING=true
export ELECTRON_ENABLE_STACK_DUMPING=true

# Start with debugging
npm run electron:dev -- --inspect=5858
```

### Development Extensions
- **React DevTools**: React component inspection
- **Redux DevTools**: State management debugging
- **Electron DevTools**: Electron-specific debugging

## 📱 Platform-Specific Features

### macOS Integration
- **Touch Bar**: Custom Touch Bar controls
- **Dock Integration**: Badge notifications
- **Menu Bar**: Native macOS menu integration
- **Notifications**: Native notification center

### Windows Integration
- **Taskbar**: Progress indicators and jump lists
- **System Tray**: Background operation support
- **File Associations**: Document type handling
- **Windows Store**: Microsoft Store distribution

### Linux Integration
- **Desktop Files**: Application launcher integration
- **System Notifications**: libnotify integration
- **Package Managers**: APT, RPM, Snap support

## 🚀 Deployment

### Release Process
```bash
# 1. Update version
npm version patch|minor|major

# 2. Build for all platforms
npm run electron:build:all

# 3. Create GitHub release
gh release create v1.0.0 electron/dist/*.dmg electron/dist/*.exe electron/dist/*.AppImage

# 4. Publish to distribution channels
npm run electron:publish
```

### Distribution Channels
- **Direct Download**: GitHub Releases
- **macOS**: Mac App Store (future)
- **Windows**: Microsoft Store (future)
- **Linux**: Snap Store, Flathub (future)

## 🔮 Future Enhancements

- **Cloud Sync**: Real-time data synchronization
- **Multi-Clinic**: Support for multiple clinic locations
- **Plugin System**: Third-party integration support
- **Advanced Security**: Hardware security key support
- **Offline Mode**: Enhanced offline capabilities
- **Print Integration**: Native printing support
- **Backup Automation**: Scheduled automatic backups

## 🆘 Troubleshooting

### Common Issues

**Application Won't Start**
```bash
# Clear Electron cache
rm -rf ~/Library/Application\ Support/SmileSync

# Reinstall dependencies
rm -rf node_modules
npm install
```

**Build Failures**
```bash
# Clear build cache
rm -rf electron/dist
rm -rf app/build

# Rebuild from scratch
npm run clean
npm run build
npm run electron:build
```

**Update Issues**
```bash
# Manual update check
npm run electron:dev -- --check-updates

# Clear update cache
rm -rf ~/Library/Caches/smilesync-updater
```

### Debug Logs
```bash
# Enable verbose logging
export DEBUG=electron*
npm run electron:dev

# Check application logs
tail -f ~/Library/Logs/SmileSync/main.log
```

---

**Electron Desktop** - Native desktop experience for SmileSync. 🖥️⚡