const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store").default;

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Maximize window on startup
  mainWindow.maximize();

  mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  //   mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC handlers for storage
ipcMain.handle("save-tabs", (event, tabs) => {
  store.set("tabs", tabs);
  return true;
});

ipcMain.handle("load-tabs", () => {
  return store.get("tabs", []);
});

ipcMain.handle("save-tab-content", (event, tabId, content) => {
  const tabs = store.get("tabs", []);
  const updatedTabs = tabs.map((tab) => (tab.id === tabId ? { ...tab, content } : tab));
  store.set("tabs", updatedTabs);
  return true;
});

ipcMain.handle("clear-all", () => {
  store.clear();
  return true;
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
