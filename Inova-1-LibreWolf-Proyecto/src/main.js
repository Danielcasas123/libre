
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

function getBrowserRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'librewolf');
  }

  return path.join(__dirname, '..', 'resources', 'librewolf');
}

function getBrowserExe() {
  const root = getBrowserRoot();

  if (!fs.existsSync(root)) {
    return null;
  }

  function findExe(dir, depth = 0) {
    if (depth > 8) return null;

    let entries;

    try {
      entries = fs.readdirSync(dir, {
        withFileTypes: true
      });
    } catch (error) {
      console.error('No se pudo leer:', dir, error.message);
      return null;
    }

    for (const entry of entries) {
      if (
        entry.isFile() &&
        entry.name.toLowerCase() === 'librewolf.exe'
      ) {
        return path.join(dir, entry.name);
      }
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = findExe(
          path.join(dir, entry.name),
          depth + 1
        );

        if (found) return found;
      }
    }

    return null;
  }

  return findExe(root);
}

function launchLibreWolf(value) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const exe = getBrowserExe();

  if (!exe) {
    console.error('No se encontró LibreWolf en:', getBrowserRoot());
    mainWindow.webContents.send('browser-missing');
    return;
  }

  const input = String(value || '').trim();

  if (!input) return;

  let url;

  if (/^https?:\/\//i.test(input)) {
    url = input;
  } else if (
    /^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(input)
  ) {
    url = 'http://' + input;
  } else if (
    /^[a-z0-9-]+(\.[a-z0-9-]+)+([/:?#].*)?$/i.test(input) &&
    !/\s/.test(input)
  ) {
    url = 'https://' + input;
  } else {
    url =
      'https://www.google.com/search?q=' +
      encodeURIComponent(input);
  }

  try {
    const browser = spawn(
      exe,
      ['-new-window', url],
      {
        detached: true,
        stdio: 'ignore',
        windowsHide: false
      }
    );

    browser.once('error', (error) => {
      console.error('Error iniciando LibreWolf:', error);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser-error');
      }
    });

    browser.unref();
  } catch (error) {
    console.error('Error:', error);

    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('browser-error');
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 760,
    minHeight: 540,
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

  mainWindow.webContents.on('did-fail-load', (_event, code, description) => {
    console.error('Error cargando la interfaz:', code, description);
  });
}

ipcMain.handle('search', (_event, query) => {
  launchLibreWolf(query);
});

ipcMain.handle('open-url', (_event, url) => {
  if (typeof url !== 'string') return;

  if (/^https?:\/\//i.test(url)) {
    launchLibreWolf(url);
  }
});

ipcMain.handle('browser-status', () => {
  return Boolean(getBrowserExe());
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

