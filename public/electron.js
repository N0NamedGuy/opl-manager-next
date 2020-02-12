const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900, height: 680, webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    if (isDev) {
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', () => mainWindow = null);
}
const installExtensions = async () => {
    const installer = require('electron-devtools-installer')
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS
    const extensions = [
        'REACT_DEVELOPER_TOOLS'
    ]

    return Promise
        .all(extensions.map(name => installer.default(installer[name], forceDownload)))
        .catch(console.log);
}

app.on('ready', async () => {
    if (isDev && process.argv.indexOf('--noDevServer') === -1) {
        await installExtensions();
    }
    createWindow();

});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
