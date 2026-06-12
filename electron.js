const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const http = require("http");
const fs = require("fs");

const isDev = process.env.NODE_ENV === "development";
let win;

const sizes = [
  [380, 500],
  [480, 650],
  [600, 800],
];
let currentSizeIdx = 1;

function serveStatic(port) {
  const distPath = path.join(__dirname, "dist");
  const server = http.createServer((req, res) => {
    let filePath = path.join(distPath, req.url === "/" ? "index.html" : req.url);
    if (!fs.existsSync(filePath)) filePath = path.join(distPath, "index.html");
    const ext = path.extname(filePath);
    const mime = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".svg": "image/svg+xml",
      ".png": "image/png",
    }[ext] || "text/plain";
    res.writeHead(200, { "Content-Type": mime });
    fs.createReadStream(filePath).pipe(res);
  });
  server.listen(port);
  return server;
}

function setupAutoUpdater() {
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "jihun0423",
    repo: "spec_clipboard_exe",
  });

  autoUpdater.on("checking-for-update", () => {
    win?.webContents.send("update-status", "checking");
  });

  autoUpdater.on("update-available", (info) => {
    win?.webContents.send("update-status", "available", info.version);
  });

  autoUpdater.on("update-not-available", () => {
    win?.webContents.send("update-status", "not-available");
  });

  autoUpdater.on("download-progress", (progress) => {
    win?.webContents.send("update-progress", Math.floor(progress.percent));
  });

  autoUpdater.on("update-downloaded", () => {
    win?.webContents.send("update-status", "downloaded");
  });

  autoUpdater.on("error", (err) => {
    win?.webContents.send("update-status", "error", err.message);
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: sizes[currentSizeIdx][0],
    height: sizes[currentSizeIdx][1],
    minWidth: 380,
    minHeight: 320,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    title: "스펙 복사기",
    autoHideMenuBar: true,
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes("accounts.google.com") ||
      url.includes("firebaseapp.com")
    ) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 500,
          height: 650,
          alwaysOnTop: true,
        },
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    serveStatic(5174);
    win.loadURL("http://localhost:5174");
    // 프로덕션에서만 업데이트 체크
    setTimeout(() => setupAutoUpdater() && autoUpdater.checkForUpdates(), 3000);
  }
}

ipcMain.on("set-always-on-top", (event, value) => {
  if (win) win.setAlwaysOnTop(value);
});

ipcMain.on("download-file", (event, { url, fileName }) => {
  win.webContents.downloadURL(url);
  win.webContents.session.once("will-download", (e, item) => {
    const savePath = path.join(app.getPath("downloads"), fileName);
    item.setSavePath(savePath);
    item.once("done", (e, state) => {
      if (state === "completed") {
        shell.showItemInFolder(savePath);
      }
    });
  });
});

ipcMain.on("open-external", (event, url) => {
  shell.openExternal(url);
});

ipcMain.on("resize-window", (event, direction) => {
  if (!win) return;
  if (direction === "up") {
    currentSizeIdx = Math.min(currentSizeIdx + 1, sizes.length - 1);
  } else {
    currentSizeIdx = Math.max(currentSizeIdx - 1, 0);
  }
  win.setSize(sizes[currentSizeIdx][0], sizes[currentSizeIdx][1]);
});

ipcMain.on("set-opacity", (event, value) => {
  if (win) win.setOpacity(value);
});

ipcMain.on("check-for-update", () => {
  if (!isDev) autoUpdater.checkForUpdates();
});

ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});