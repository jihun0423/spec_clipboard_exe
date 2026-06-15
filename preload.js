const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setAlwaysOnTop: (value) => ipcRenderer.send("set-always-on-top", value),
  downloadFile: (url, fileName) => ipcRenderer.send("download-file", { url, fileName }),
  openExternal: (url) => ipcRenderer.send("open-external", url),
  resizeWindow: (direction) => ipcRenderer.send("resize-window", direction),
  setOpacity: (value) => ipcRenderer.send("set-opacity", value),
  checkForUpdate: () => ipcRenderer.send("check-for-update"),
  installUpdate: () => ipcRenderer.send("install-update"),
  onUpdateStatus: (callback) => ipcRenderer.on("update-status", (e, status, info) => callback(status, info)),
  onUpdateProgress: (callback) => ipcRenderer.on("update-progress", (e, percent) => callback(percent)),
  autoFill: (data) => ipcRenderer.invoke("auto-fill", data),
});