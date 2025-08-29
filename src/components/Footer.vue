<template>
  <footer class="footer">
    <div class="footer__content">
      <!-- Logo / nombre -->
      <div class="footer__brand">
        <img src="/imagenes/Guadioleo.png" alt="Guadioleo" class="footer__logo" />
        <span class="footer__title">Guadioleo S.L.</span>
      </div>

      <!-- Info -->
      <div class="footer__info">
        <p>© {{ new Date().getFullYear() }} Guadioleo. Todos los derechos reservados.</p>
        <p>Desarrollado por <strong>José Ramón Hurtado Mije</strong></p>
        <p>Soporte técnico: <a href="mailto:jhurtadomije@gmail.com">jhurtadomije@gmail.com</a></p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #556B2F, #6B8E23); /* verde oliva degradado */
  color: #fff;
  padding: 1.5rem 2rem;
  font-size: 0.9rem;
  margin-top: auto;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.15);
  border-top: 4px solid #FFD700; /* borde superior dorado */
}

.footer__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.footer__logo {
  width: 38px;
  height: 38px;
}

.footer__title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #FFD700; /* dorado */
}

.footer__info {
  font-size: 0.85rem;
  color: #f0f0f0;
}

.footer__info a {
  color: #FFD700; /* dorado para resaltar */
  text-decoration: none;
  font-weight: 500;
}

.footer__info a:hover {
  text-decoration: underline;
}
</style>
