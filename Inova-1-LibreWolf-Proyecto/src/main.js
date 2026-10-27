const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
function getBrowserExe() {
  const root = app.isPackaged
    ? path.join(process.resourcesPath, 'librewolf')
    : path.join(__dirname, '..', 'resources', 'librewolf');
  const candidates = ['librewolf.exe', 'LibreWolf.exe'];
  for (const name of candidates) {
    const candidate = path.join(root, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}
function launchLibreWolf(url) {
  const exe = getBrowserExe();
  if (!exe) {
    mainWindow?.webContents.send('browser-missing');
    return;
  }
  const safeUrl = /^https?:\/\//i.test(url) ? url : 'https://www.google.com/search?q=' + encodeURIComponent(url);
  try {
    const child = spawn(exe, ['-new-window', safeUrl], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    });
    child.on('error', () => mainWindow?.webContents.send('browser-error'));
    child.unref();
  } catch (_) {
    mainWindow?.webContents.send('browser-error');
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180, height: 760, minWidth: 760, minHeight: 540,
    backgroundColor: '#0b0e14',
    title: 'Inova 1',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}
ipcMain.handle('search', (_event, query) => {
  const value = String(query || '').trim();
  if (!value) return;
  const url = /^https?:\/\//i.test(value) ? value : 'https://www.google.com/search?q=' + encodeURIComponent(value);
  launchLibreWolf(url);
});
ipcMain.handle('open-url', (_event, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) launchLibreWolf(url);
});
ipcMain.handle('browser-status', () => Boolean(getBrowserExe()));
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
