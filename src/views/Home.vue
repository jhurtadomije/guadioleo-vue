<template>
  <div class="container">
    <header class="header">
      <img src="/imagenes/Guadioleo.png" alt="Logo" class="logo" />
      <h2>Seleccione una opción</h2>
    </header>

    <!-- Menú con router-link -->
    <main id="menu-principal">
      <div class="menu-grid">
        <router-link to="/configurar" class="card">
          <img src="/imagenes/configurarLote.png" alt="Configurar Lote" />
          <span>Configurar Lote</span>
        </router-link>

        <router-link to="/liquidacion" class="card">
          <img src="/imagenes/Liquidacion.png" alt="Realizar Liquidación" />
          <span>Realizar Liquidación</span>
        </router-link>

        <router-link to="/guardados" class="card">
          <img src="/imagenes/lotesGuardados.png" alt="Lotes Guardados" />
          <span>Lotes Guardados</span>
        </router-link>

        <router-link to="/historico" class="card">
          <img src="/imagenes/liquidacionesGuardadas.png" alt="Liquidaciones Realizadas" />
          <span>Liquidaciones Realizadas</span>
        </router-link>
      </div>
    </main>
<!-- Botón logout -->
    <button class="boton advertencia" @click="logout">
  Cerrar sesión
</button>
   
  </div>
   
</template>

<script setup>
import { useRouter } from 'vue-router'
import { auth } from '../services/firebase'
import { signOut } from 'firebase/auth'

const router = useRouter()

const logout = async () => {
  await signOut(auth)
  localStorage.clear()   // borramos sesión
  router.push("/")       // volvemos al Welcome
}

</script>


<style scoped>
.container {
  flex: 1;
  max-width: 70rem;
  margin: auto;
  padding: 2.5rem 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfdfd, #f5f5f0);
}

/* === CABECERA === */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeDown 0.8s ease;
}

.logo {
  width: clamp(6rem, 25vw, 10rem); /* 🔥 adaptable */
  height: auto;
  margin-bottom: 0.75rem;
}

.header h2 {
  font-size: clamp(1.4rem, 4vw, 1.8rem); /* 🔥 escala en móvil */
  color: var(--color-olive-dark);
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* === MENÚ PRINCIPAL === */
#menu-principal {
  text-align: center;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); /* 🔥 más flexible */
  gap: 1.5rem;
}

/* === CARDS === */
.card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  padding: clamp(1.2rem, 4vw, 2rem) 1rem; /* 🔥 reduce padding en móvil */
  text-align: center;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;

  animation: fadeUp 0.6s ease both;
}

.card img {
  width: clamp(3.5rem, 12vw, 5rem); /* 🔥 íconos escalables */
  height: clamp(3.5rem, 12vw, 5rem);
  margin-bottom: 0.8rem;
  object-fit: contain;
  transition: transform 0.35s ease;
}

.card span {
  display: block;
  margin-top: 0.5rem;
  font-size: 1rem;
}

.card:hover {
  transform: translateY(-8px) scale(1.04);
  box-shadow: 0 12px 28px rgba(0,0,0,0.15);
  border-color: var(--color-gold);
  color: var(--color-olive-dark);
  background: linear-gradient(135deg, #fff, #fdf8f0);
}

.card:hover img {
  transform: scale(1.15) rotate(-4deg);
}
.boton.advertencia {
  margin: 2rem auto 0;
  display: block;
  width: fit-content;
  min-width: 12rem;
}

/* === Animaciones === */
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === 📱 Ajustes móvil === */
@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: 1fr; /* 🔥 cards en una sola columna */
    gap: 1rem;
  }

  .card {
    padding: 1.2rem;
    font-size: 0.95rem;
  }

  /* El botón ocupa casi todo el ancho en móvil */
  .boton.advertencia {
    width: 90%;
    min-width: unset;
  }
}

</style>