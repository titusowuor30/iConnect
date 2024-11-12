// main.js
const electronApp = require('electron').app;
const electronBrowserWindow = require('electron').BrowserWindow;
const electronIpcMain = require('electron').ipcMain;

const nodePath = require("path");

// Prevent garbage collection
let window;

function createWindow() {
  mainwindow = new electronBrowserWindow({
    x: 0,
    y: 0,
    width: 1500,
    height: 800,
    center: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: nodePath.join(__dirname, 'getData.js')
    }
  });
  mainwindow.on('close', (event) => {
    if (!electronApp.isQuiting) {
      event.preventDefault()
      mainwindow.hide()
    }
  })

  // Dereference the window object when the window is closed
  mainwindow.on('closed', () => {
    mainwindow = null
  })
  return mainwindow;
}

function showMainWindow() {
  window.loadFile('index.html')
    .then(() => { window.show(); window.maximize(); })
}

function showLoginWindow() {
  // window.loadURL('https://www.your-site.com/login')
  window.loadFile('pages/sign-in.html') // For testing purposes only
    .then(() => { window.show(); window.maximize(); })
}
function showLockedOutWindow() {
  // window.loadURL('https://www.your-site.com/login')
  window.loadFile('pages/showLockedOut.html') // For testing purposes only
}
function settingsWindow() {
  // window.loadURL('https://www.your-site.com/login')
  window.loadFile('settings.html') // For testing purposes only
}
electronApp.on('ready', () => {
  window = createWindow();
  showLoginWindow();
});

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // electronApp.quit();
    window.hide;
  }
});

electronApp.on('activate', () => {
  if (electronBrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// ----- IPC -----

electronIpcMain.on('message:loginShow', (event) => {
  showLoginWindow();
})

electronIpcMain.on('message:loginSuccessful', (event, session) => {
  showMainWindow();
})

electronIpcMain.on('message:showLockedOut', (event, session) => {
  showLockedOutWindow();
})

electronIpcMain.on('message:settings', (event, session) => {
  settingsWindow();
})


// Modules to control application life and create native browser window
// const { app, BrowserWindow } = require('electron')
// const path = require('path')
// const sqlite = require('sqlite-electron')
// const electronIpcMain = require('electron').ipcMain;
// let myWindow = null
// //const kenloadv2 = require('./kenloadv2.js')
// const gotTheLock = app.requestSingleInstanceLock()
// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 1500,
//     height: 1000,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       enableRemoteModule: true,
//       preload: path.join(__dirname, 'preload.js')
//     }
//   })
//   //mainWindow.webContents.openDevTools()

electronApp.on('close', (event) => {
  if (app.quitting) {
    win = null
    window.hide()
  } else {
    event.preventDefault()
    window.hide()
  }
})


//   // and load the index.html of the app.
//   //mainWindow.loadFloadURL('http://192.168.5.22:8000')
//   mainWindow.loadFile('pages/sign-in.html')

//   // Open the DevTools.
//   // mainWindow.webContents.openDevTools()
// }

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   createWindow()

//   app.on('activate', () => {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     //if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })
// function showMainWindow() {
//   window.loadFile('index.html')
//       .then(() => { window.show(); })
// }

// function showLoginWindow() {
//   // window.loadURL('https://www.your-site.com/login')
//   window.loadFile('login.html') // For testing purposes only
//       .then(() => { window.show(); })
// }
// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit()
// })
// if (!gotTheLock) {
//   app.quit()
// }
// app.on('before-quit', () => app.quitting = true)

// electronIpcMain.on('message:loginShow', (event) => {
//   showLoginWindow();
// })

// electronIpcMain.on('message:loginSuccessful', (event, session) => {
//   showMainWindow();
// })


// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.cd..
