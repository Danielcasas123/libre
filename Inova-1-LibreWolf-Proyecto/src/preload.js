const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('inova', {
  search: (query) => ipcRenderer.invoke('search', query),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  browserStatus: () => ipcRenderer.invoke('browser-status'),
  onBrowserMissing: (callback) => ipcRenderer.on('browser-missing', callback),
  onBrowserError: (callback) => ipcRenderer.on('browser-error', callback)
});
