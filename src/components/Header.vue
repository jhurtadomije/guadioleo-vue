<template>
  <header v-if="showHeader" class="header">
    <div class="header__content">
      <!-- Logo + título -->
      <div class="header__brand">
        <img src="/imagenes/Guadioleo.png" alt="Guadioleo" class="header__logo" />
        <h1 class="header__title">Guadioleo</h1>
      </div>

      <!-- Iconos de contacto -->
      <div class="header__icons">
        <!-- WhatsApp -->
        <a href="https://wa.me/34652407574" target="_blank" title="WhatsApp">
          <MessageCircle class="icon" />
        </a>
        <!-- Teléfono -->
        <a href="tel:+34652407574" title="Teléfono">
          <Phone class="icon" />
        </a>
        <!-- Email -->
        <a href="mailto:jhurtadomije@gmail.com" title="Email">
          <Mail class="icon" />
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Phone, Mail, MessageCircle } from "lucide-vue-next";

const route = useRoute();

const showHeader = computed(() => {
  return !["Welcome", "Login"].includes(route.name);
});
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #556B2F, #6B8E23); /* verde oliva degradado */
  color: #fff;
  padding: 0.8rem 1.5rem;
  border-bottom: 4px solid #FFD700; /* dorado */
}

.header__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header__logo {
  width: 34px;
  height: 34px;
}

.header__title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #FFD700;
}

.header__icons {
  display: flex;
  gap: 1rem;
}

.icon {
  width: 22px;
  height: 22px;
  stroke: #FFD700;
  cursor: pointer;
  transition: transform 0.2s;
}

.icon:hover {
  transform: scale(1.15);
}
</style>
