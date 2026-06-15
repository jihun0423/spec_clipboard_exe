require("dotenv").config();

const { app, BrowserWindow, ipcMain, shell, screen } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const http = require("http");
const fs = require("fs");
const https = require("https");
const { exec } = require("child_process");

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
    if (url.includes("accounts.google.com") || url.includes("firebaseapp.com")) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: { width: 500, height: 650, alwaysOnTop: true },
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
      if (state === "completed") shell.showItemInFolder(savePath);
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

// ── AI 자동입력 ──
ipcMain.handle("auto-fill", async (event, data) => {
  try {
    const screenshot = require("screenshot-desktop");
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

    console.log("API Key 확인:", apiKey ? "있음" : "없음");

    // DPI 스케일 확인
    const primaryDisplay = screen.getPrimaryDisplay();
    const scaleFactor = primaryDisplay.scaleFactor;
    const screenSize = primaryDisplay.size; // CSS 픽셀 기준
    console.log("스케일팩터:", scaleFactor, "화면크기:", screenSize);

    win.setAlwaysOnTop(false);
    win.minimize();
    await new Promise(r => setTimeout(r, 800));

    const imgBuffer = await screenshot({ format: "png" });
    const base64Image = imgBuffer.toString("base64");
    console.log("캡처 완료, 크기:", base64Image.length);

    win.restore();
    win.setAlwaysOnTop(true);

    const prompt = buildPrompt(data);
    console.log("Claude 호출 중...");
    const claudeResult = await callClaudeVision(base64Image, prompt, apiKey);
    console.log("Claude 결과:", JSON.stringify(claudeResult));

    if (!claudeResult.fields || claudeResult.fields.length === 0) {
      return { success: false, error: "입력할 필드를 찾지 못했어요." };
    }

    let filled = 0;
    const logs = [];

    for (const field of claudeResult.fields) {
      try {
        // 실제 물리 픽셀 기준 좌표 계산 (DPI 스케일 적용)
        const absX = Math.round(field.x * screenSize.width);
        const absY = Math.round(field.y * screenSize.height);
        console.log("입력 시도:", field.label, field.value, absX, absY, "(scale:", scaleFactor + ")");

        // 임시 ps1 파일에 UTF-8 BOM으로 저장
        const psScript = [
          "Add-Type -AssemblyName System.Windows.Forms",
          "Add-Type -AssemblyName System.Drawing",
          "Add-Type @\"",
          "using System;",
          "using System.Runtime.InteropServices;",
          "public class MouseHelper {",
          "  [DllImport(\"user32.dll\")] public static extern void mouse_event(int f, int x, int y, int c, int e);",
          "}",
          "\"@",
          `[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${absX}, ${absY})`,
          "Start-Sleep -Milliseconds 150",
          "[MouseHelper]::mouse_event(0x0002, 0, 0, 0, 0)",
          "[MouseHelper]::mouse_event(0x0004, 0, 0, 0, 0)",
          "Start-Sleep -Milliseconds 200",
          "[System.Windows.Forms.SendKeys]::SendWait('^a')",
          `Set-Clipboard -Value @"`,
          field.value,
          `"@`,
          "[System.Windows.Forms.SendKeys]::SendWait('^v')",
        ].join("\r\n");

        const tmpFile = path.join(app.getPath("temp"), "specclip_input.ps1");
        // UTF-8 BOM으로 저장해야 한글/한자 처리 가능
        const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
        const content = Buffer.from(psScript, "utf8");
        fs.writeFileSync(tmpFile, Buffer.concat([bom, content]));

        await new Promise((resolve, reject) => {
          exec(
            `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${tmpFile}"`,
            { timeout: 5000, input: "Y\n" },
            (err, stdout, stderr) => {
              if (err) {
                console.error("PS 오류:", stderr);
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });

        filled++;
        logs.push("✓ " + field.label + ": " + field.value);
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.error("입력 실패:", e.message);
        logs.push("⚠ " + field.label + " 입력 실패");
      }
    }

    return { success: true, filled, logs };
  } catch (e) {
    console.error("auto-fill 오류:", e.message);
    return { success: false, error: e.message };
  }
});

function buildPrompt(data) {
  const certs = (data.certs || []).map(c =>
    "자격증: " + c.name + ", 번호: " + c.number + ", 취득일: " + c.date + ", 발급기관: " + c.issuer
  ).join("\n");

  const basic = (data.basic || []).map(b => b.label + ": " + b.value).join("\n");

  const education = (data.education || []).map(e =>
    "학교: " + e.name + ", 기간: " + e.period + ", 학점: " + e.gpa_total
  ).join("\n");

  const career = (data.career || []).map(c =>
    "기관: " + c.org + ", 구분: " + c.type + ", 기간: " + c.period + ", 내용: " + c.desc
  ).join("\n");

  return "아래는 사용자의 스펙 정보야.\n\n" +
    "[자격증]\n" + certs + "\n\n" +
    "[기본정보]\n" + basic + "\n\n" +
    "[학력]\n" + education + "\n\n" +
    "[경력/봉사]\n" + career + "\n\n" +
    "위 스펙 정보를 바탕으로, 화면에 보이는 채용사이트 입력 폼을 분석해줘.\n" +
    "입력 가능한 필드를 찾아서 아래 JSON 형식으로만 응답해줘. 다른 텍스트는 절대 쓰지 마.\n\n" +
    "{\"fields\":[{\"label\":\"필드명\",\"value\":\"입력할 값\",\"x\":0.5,\"y\":0.3}]}\n\n" +
    "x, y는 스크린샷 이미지 크기 대비 0~1 사이의 비율 좌표야. 정확한 필드 중앙을 가리켜야 해.\n" +
    "라디오 버튼, 체크박스는 제외해줘.\n" +
    "드롭다운(select)은 제외하되, 드롭다운 옆에 있는 텍스트 input 필드는 포함해줘.\n" +
    "텍스트를 직접 입력할 수 있는 input 필드만 포함해줘.\n" +
    "입력할 값이 없는 필드는 제외해줘.";
}

async function callClaudeVision(base64Image, prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: base64Image }
          },
          { type: "text", text: prompt }
        ]
      }]
    });

    const req = https.request({
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      }
    }, (res) => {
      let rawData = "";
      res.on("data", chunk => rawData += chunk);
      res.on("end", () => {
        try {
          console.log("Claude 원본 응답:", rawData);
          const parsed = JSON.parse(rawData);
          const text = parsed.content?.[0]?.text || "{}";
          console.log("Claude 텍스트:", text);
          const clean = text.replace(/```json|```/g, "").trim();
          resolve(JSON.parse(clean));
        } catch (e) {
          console.error("파싱 실패:", rawData);
          reject(new Error("Claude 응답 파싱 실패: " + rawData));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});