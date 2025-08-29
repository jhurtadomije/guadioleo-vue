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

  if (!app.isPackaged) {
    // 🔹 En desarrollo
    console.log("🌍 Modo desarrollo: cargando desde Vite: http://localhost:5173");
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // 🔹 En producción
    const indexPath = path.join(process.resourcesPath, "dist", "index.html");

    console.log("📂 Modo producción: intentando cargar:", indexPath);

    win.loadFile(indexPath).catch((err) => {
      console.error("❌ Error cargando index.html:", err);

      // Fallback: mostrar página de error
      win.loadURL(
        `data:text/html;charset=utf-8,
        <html>
          <head>
            <title>Error</title>
          </head>
          <body>
            <h1>⚠️ No se pudo cargar la aplicación</h1>
            <p>Verifique que los archivos de <b>dist/</b> estén en resources.</p>
            <pre>${err}</pre>
          </body>
        </html>`
      );
    });
  }
}

app.whenReady().then(() => {
  console.log("🚀 Electron iniciado");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle("ping", () => "pong desde main!");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
