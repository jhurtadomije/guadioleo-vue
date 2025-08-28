import { createRouter, createWebHistory } from "vue-router";

// Importamos las vistas
import Welcome from "../views/Welcome.vue";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Configurar from "../views/Configurar.vue";
import Liquidacion from "../views/Liquidacion.vue";
import Guardados from "../views/Guardados.vue";
import Historico from "../views/Historico.vue";

const routes = [
  { path: "/", name: "Welcome", component: Welcome },
  { path: "/login", name: "Login", component: Login },
  { path: "/home", name: "Home", component: Home, meta: { requiresAuth: true } },
  { path: "/configurar", name: "Configurar", component: Configurar, meta: { requiresAuth: true } },
  { path: "/liquidacion", name: "Liquidacion", component: Liquidacion, meta: { requiresAuth: true } },
  { path: "/guardados", name: "Guardados", component: Guardados, meta: { requiresAuth: true } },
  { path: "/historico", name: "Historico", component: Historico, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🚨 Middleware para proteger rutas
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem("uid");

  if (to.meta.requiresAuth && !isAuth) {
    next("/login"); // si no está logueado, lo mandamos a login
  } else {
    next();
  }
});

export default router;
