const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getVersion: () => ipcRenderer.invoke('app-version'),
  
  // File system operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Menu event listeners
  onMenuNewPatient: (callback) => {
    ipcRenderer.on('menu-new-patient', callback);
    return () => ipcRenderer.removeListener('menu-new-patient', callback);
  },
  
  onMenuNewAppointment: (callback) => {
    ipcRenderer.on('menu-new-appointment', callback);
    return () => ipcRenderer.removeListener('menu-new-appointment', callback);
  },
  
  onMenuExportData: (callback) => {
    ipcRenderer.on('menu-export-data', callback);
    return () => ipcRenderer.removeListener('menu-export-data', callback);
  },
  
  // Platform information
  platform: process.platform,
  
  // Environment information
  isDev: process.env.NODE_ENV === 'development'
});

// Expose a limited API for the renderer process
contextBridge.exposeInMainWorld('smileSync', {
  // Application metadata
  appName: 'SmileSync Solutions',
  version: '1.0.0',
  
  // Feature flags
  features: {
    exportData: true,
    printInvoices: true,
    backupData: true
  }
});