const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setAlwaysOnTop: (value) => ipcRenderer.send("set-always-on-top", value),
  downloadFile: (url, fileName) => ipcRenderer.send("download-file", { url, fileName }),
  openExternal: (url) => ipcRenderer.send("open-external", url),
  resizeWindow: (direction) => ipcRenderer.send("resize-window", direction),
  setOpacity: (value) => ipcRenderer.send("set-opacity", value),
  checkForUpdate: () => ipcRenderer.send("check-for-update"),
  installUpdate: () => ipcRenderer.send("install-update"),
  onUpdateStatus: (cb) => ipcRenderer.on("update-status", (_, ...args) => cb(...args)),
  onUpdateProgress: (cb) => ipcRenderer.on("update-progress", (_, val) => cb(val)),
  autoFill: (data) => ipcRenderer.invoke("auto-fill", data),
  previewFile: (url, fileName) => ipcRenderer.send("preview-file", { url, fileName }),
  previewTogglePin: (value) => ipcRenderer.send("preview-toggle-pin", value),
});