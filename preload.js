const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveTabs: (tabs) => ipcRenderer.invoke('save-tabs', tabs),
  loadTabs: () => ipcRenderer.invoke('load-tabs'),
  saveTabContent: (tabId, content) => ipcRenderer.invoke('save-tab-content', tabId, content),
  clearAll: () => ipcRenderer.invoke('clear-all')
});