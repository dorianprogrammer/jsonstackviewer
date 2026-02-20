const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store").default;
const { parse } = require("jsonc-parser");

if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron"),
    hardResetMethod: "exit",
    ignored: /node_modules|[\/\\]\./,
  });
}
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

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

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
      let content = fs.readFileSync(filePath, "utf-8");

      // remove UTF-8 BOM if present
      content = content.replace(/^\uFEFF/, "");

      // Validar como JSONC (permite comentarios y trailing commas)
      const errorsParse = [];
      const parsed = parse(content, errorsParse, { allowTrailingComma: true });

      if (errorsParse.length > 0 || parsed === undefined) {
        throw new Error("Contenido inválido (JSON/JSONC).");
      }

      // Si quieres normalizar/bonito al importar:
      const formatted = JSON.stringify(parsed, null, 2);

      importedFiles.push({ name: path.basename(filePath), content: formatted });
    } catch (error) {
      errors.push(`El archivo "${path.basename(filePath)}" no es un JSON válido. Detalle: ${error?.message ?? error}`);
    }
  }

  return { importedFiles, errors };
});

// exporta archivos json
ipcMain.handle("export-json-file", async (event, { defaultFileName, content }) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: "Exportar JSON",
    defaultPath: defaultFileName || "data.json",
    filters: [{ name: "Archivos JSON", extensions: ["json"] }],
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    // opcional: asegurar extensión .json
    const finalPath = filePath.toLowerCase().endsWith(".json") ? filePath : `${filePath}.json`;

    fs.writeFileSync(finalPath, content ?? "", "utf-8");
    return { success: true, filePath: finalPath };
  } catch (error) {
    return { success: false, error: error?.message ?? String(error) };
  }
});

app.commandLine.appendSwitch("disable-http-cache");
app.commandLine.appendSwitch("disable-gpu");

if (process.env.NODE_ENV === "development") {
  const os = require("os");
  app.setPath("userData", path.join(os.tmpdir(), "jsonstackviewer-dev"));
}

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
