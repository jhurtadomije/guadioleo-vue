<template>
  <div class="welcome">
    <img src="/imagenes/Guadioleo.png" alt="Logo" class="logo-welcome" />
    <h1>Bienvenido a Guadioleo</h1>
    <button class="boton" @click="irLogin">Entrar</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function irLogin() {
  router.push('/login')
}
</script>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  background: var(--color-bg, #f9f9f9);
  padding: clamp(1rem, 4vw, 2rem);
}

/* Logo responsivo */
.logo-welcome {
  width: clamp(8rem, 40vw, 14rem);
  height: auto;
  margin-bottom: 1.5rem;
}

/* Título */
h1 {
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  color: var(--color-olive-dark);
  margin-bottom: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Botón */
.boton {
  padding: clamp(0.6rem, 2.5vw, 0.9rem) clamp(1.2rem, 5vw, 2rem);
  background: var(--color-olive-dark);
  color: var(--blanco, #fff);
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.boton:hover {
  background: var(--color-gold);
  color: var(--color-olive-dark);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 0.25rem 0.6rem rgba(0,0,0,0.15);
}
</style>