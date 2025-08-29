<template>
  <div class="app-container">
    <!-- Header (se muestra solo en las vistas permitidas) -->
    <Header />

    <!-- Aquí se renderizan las páginas -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer siempre visible -->
    <Footer />
  </div>
</template>

<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>
