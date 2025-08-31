const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../app/build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Start backend server
function startBackendServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // In development, assume backend is running separately
      console.log('Development mode: Backend should be running on port 5001');
      resolve();
      return;
    }

    const { spawn } = require('child_process');
    const backendPath = path.join(__dirname, '../backend/index.js');
    
    console.log('Starting backend server in production mode...');
    
    backendProcess = spawn('node', [backendPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        PORT: '5001'
      }
    });

    let serverStarted = false;
    const startupTimeout = setTimeout(() => {
      if (!serverStarted) {
        reject(new Error('Backend server startup timeout'));
      }
    }, 30000); // 30 second timeout

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Backend:', output);
      
      // Check if server has started successfully
      if (output.includes('Server running on port') || output.includes('Database initialized')) {
        if (!serverStarted) {
          serverStarted = true;
          clearTimeout(startupTimeout);
          resolve();
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data.toString());
    });

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend server:', err);
      clearTimeout(startupTimeout);
      reject(err);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`Backend process exited with code ${code} and signal ${signal}`);
      if (!serverStarted) {
        clearTimeout(startupTimeout);
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });
  });
}

// App event handlers
app.whenReady().then(async () => {
  try {
    createWindow();
    createMenu();
    
    // Show loading state
    mainWindow.webContents.once('dom-ready', () => {
      if (!isDev) {
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; background: #f5f5f5;"><div style="text-align: center;"><h2>Starting SmileSync...</h2><p>Initializing backend services...</p></div></div>';
        `);
      }
    });
    
    // Start backend server and wait for it to be ready
    await startBackendServer();
    
    // Load the actual app after backend is ready
    if (!isDev) {
      const startUrl = `file://${path.join(__dirname, '../app/build/index.html')}`;
      mainWindow.loadURL(startUrl);
    }
    
    console.log('SmileSync application started successfully');
    
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Startup Error', `Failed to start SmileSync: ${error.message}`);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Patient',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-patient');
          }
        },
        {
          label: 'New Appointment',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu-new-appointment');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          click: () => {
            mainWindow.webContents.send('menu-export-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SmileSync',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About SmileSync',
              message: 'SmileSync Solutions v1.0.0',
              detail: 'Comprehensive dental clinic management application\n\nDeveloped by SmileSync Solutions'
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Backend status monitoring
ipcMain.handle('get-backend-status', () => {
  return {
    isRunning: backendProcess ? !backendProcess.killed : false,
    port: 5001,
    environment: isDev ? 'development' : 'production'
  };
});

// Window control handlers
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Data management handlers
ipcMain.handle('export-all-data', async () => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export All Data',
      defaultPath: `smilesync-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      // This would typically call the backend API to export data
      return { success: true, path: filePath };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    
    if (filePaths && filePaths.length > 0) {
      // This would typically call the backend API to import data
      return { success: true, path: filePaths[0] };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-backup', async () => {
  try {
    // This would typically call the backend API to create a backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(app.getPath('userData'), 'backups', `backup-${timestamp}.db`);
    return { success: true, path: backupPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Notification handler
ipcMain.handle('show-notification', async (event, { title, body, options = {} }) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      ...options
    });
    
    notification.show();
    return { success: true };
  }
  
  return { success: false, error: 'Notifications not supported' };
});

// System integration handlers
ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-in-folder', async (event, fullPath) => {
  const { shell } = require('electron');
  try {
    shell.showItemInFolder(fullPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle app protocol for deep linking (optional)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('smilesync', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('smilesync');
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});