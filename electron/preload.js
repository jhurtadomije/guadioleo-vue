// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Mensaje al cargar
window.addEventListener("DOMContentLoaded", () => {
  console.log("Guadioleo cargado en Electron ✅");
});

contextBridge.exposeInMainWorld("isElectron", true);
// 🔹 API segura para el frontend
contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping") // ejemplo básico
});
