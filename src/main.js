import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/base.css'

console.log("🚀 Iniciando Vue...");

// 👇 comprobamos si la flag existe
if (window.isElectron) {
  console.log("✅ Ejecutando en Electron");
} else {
  console.log("🌐 Ejecutando en navegador");
}

const app = createApp(App)
app.use(router)
app.mount('#app')
