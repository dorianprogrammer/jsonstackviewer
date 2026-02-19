const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store").default;

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron"),
  hardResetMethod: "exit",
  ignored: /node_modules|[\/\\]\./,
});
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

  mainWindow.maximize();

  mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

const menu = Menu.buildFromTemplate([
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  },
]);
Menu.setApplicationMenu(menu);

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

// importa archvios json
ipcMain.handle("import-json-files", async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Importar archivos JSON",
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Archivos JSON", extensions: ["json"] }],
  });

  if (canceled || !filePaths.length) return { importedFiles: [], errors: [] };

  const importedFiles = [];
  const errors = [];

  for (const filePath of filePaths) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      JSON.parse(content); // Validar que sea JSON
      importedFiles.push({ name: path.basename(filePath), content });
    } catch (error) {
      errors.push(`El archivo "${path.basename(filePath)}" no es un JSON válido.`);
    }
  }

  return { importedFiles, errors };
});

app.commandLine.appendSwitch("disable-http-cache");
app.commandLine.appendSwitch("disable-gpu");

const os = require("os");
app.setPath("userData", path.join(os.tmpdir(), "jsonstackviewer-dev"));

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
