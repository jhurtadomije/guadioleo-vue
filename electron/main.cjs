// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), 
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // 🔹 En desarrollo: carga la URL del servidor de Vite
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools(); 
  } else {
    // 🔹 En producción: carga el build generado
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle("ping", () => {
  return "pong desde main!";
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
