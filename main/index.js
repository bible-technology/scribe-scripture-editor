// Native
require('@electron/remote/main').initialize();
const path = require('path');
const fs = require('fs');
const { format } = require('url');
const { install } = require('@puppeteer/browsers');
const config = require("dotenv");
config.config();

// Packages
const { BrowserWindow, app, ipcMain } = require('electron');
// const isDev = require('electron-is-dev');
const prepareNext = require('electron-next');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let browserPath;
function isDev() {
  return process.argv[2] == '--dev';
}

async function setPermissions(chromePath) {
  try {
    fs.chmodSync(chromePath, '755');
  } catch (err) {
    console.error(`Failed to set permissions for ${chromePath}: `, err);
  }
}

function getChromeCacheDir() {
  const dataDir = app.getPath('appData');

  const chromeDataDir = path.join(dataDir, 'chrome-cache');
  const chromeDataDirFilePath = path.join(chromeDataDir, 'executablePath');

  // Create the folder if it doesn't exist
  try {
    fs.accessSync(chromeDataDir);
  } catch (err) {
    // If the directory doesn't exist, create it
    fs.mkdirSync(chromeDataDir, { recursive: true });
    fs.appendFileSync(chromeDataDirFilePath, '', 'utf8');
    console.log(`Created persistent Chrome data directory at: ${chromeDataDir}`);
  }

  return chromeDataDir;
}

async function verifyAndInstallChrome(version) {
  // Get the persistent directory
  const cacheDir = getChromeCacheDir();
  const cacheDirFilePath = path.join(cacheDir, 'executablePath');

  // Check if the browser is already installed
  
  // fs.accessSync(cacheDirFilePath);
  const data = fs.readFileSync(cacheDirFilePath, 'utf8');
  if(data.trim() !== '') {
    console.log(`Chrome version ${version} is already installed at '${data}'`);
    browserPath = data;
    return browserPath;
  }
  console.log(`Chrome version ${version} is not installed. Installing now...`);
  await install({
    cacheDir,
    browser: 'chrome',
    buildId: version,
  }).then((res) => {
    if (fs.existsSync(res.executablePath)) {
      browserPath = res.executablePath;
      fs.appendFileSync(cacheDirFilePath, res.executablePath, 'utf8');
      console.log(`Chrome version ${version} has been installed to ${browserPath}.`);
    }
    setPermissions(browserPath);
  }).catch((err) => {
    throw new Error(`Failed to install Chrome version ${version} : ${err}`);
  });
}

// Prepare the renderer once the app is ready
async function createWindow() {
 mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  require('@electron/remote/main').enable(mainWindow.webContents);
  const url = isDev()
    ? 'http://localhost:8000'
    : format({
        pathname: path.join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  // useful line of code to debug puppet with the console in the app
  // app.commandLine.appendSwitch('remote-debugging-port', '8000');

  verifyAndInstallChrome('121.0.6167.85')
  .catch(err => {
    console.error(`Failed to verify or install Chrome: ${err.message}`);
  });

  mainWindow.loadURL(url);
  autoUpdater.checkForUpdatesAndNotify();
}

ipcMain.handle('get-browser-path', async (event) => {
  await verifyAndInstallChrome('121.0.6167.85').catch(err => {
    console.error(`Failed to verify or install Chrome: ${err.message}`);
  });
  return browserPath;
});

// prevent multiple app window opening
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) { mainWindow.restore(); }
      mainWindow.focus();
    }
  });

  // Create myWindow, load the rest of the app, etc...

// Quit the app once all windows are closed
app.on('ready', async () => {
  await prepareNext('./renderer');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    await pie.initialize(app);
    createWindow();
  }
});

// listen the channel `message` and resend the received message to the renderer process
// ipcMain.on('message', (event) => {
//   event.sender.send('appPath', process.env.APPDATA)
// })

ipcMain.on('app_version', (event) => {
  event.sender.send(
    'app_version',
    {
      version: app.getVersion(),
      appPath: process.env.APPDATA
      ? process.env.APPDATA : `${process.env.HOME}/.config`,
    },
);
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${ progressObj.bytesPerSecond}`;
  log_message = `${log_message } - Downloaded ${ progressObj.percent }%`;
  log_message = `${log_message } (${ progressObj.transferred }/${ progressObj.total })`;
  mainWindow.webContents.send(log_message);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// else ends here
}
