const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 600,
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

  // Google 로그인 팝업 허용
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("accounts.google.com") || url.includes("firebaseapp.com")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 500,
          height: 650,
          alwaysOnTop: true,
        },
      };
    }
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

ipcMain.on("set-always-on-top", (event, value) => {
  if (win) win.setAlwaysOnTop(value);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});