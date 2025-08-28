<template>
  <div class="modal-overlay" @click.self="onOverlayClick">
    <div
      class="modal-content"
      :style="contentStyle"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
      ref="contentRef"
      tabindex="-1"
    >
      <button v-if="closeButton" class="modal-close" @click="$emit('cerrar')" aria-label="Cerrar">×</button>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watchEffect } from 'vue'

const props = defineProps({
  /** ancho máximo del modal (px, %, rem…) */
  width: { type: String, default: '42rem' },
  /** si true, no se cierra al hacer click fuera */
  persistent: { type: Boolean, default: false },
  /** mostrar botón de cerrar arriba a la derecha */
  closeButton: { type: Boolean, default: true },
  /** etiqueta accesible si no hay h2 dentro */
  ariaLabel: { type: String, default: 'Diálogo' }
})
const emit = defineEmits(['cerrar'])

const contentRef = ref(null)

const contentStyle = { maxWidth: props.width }

function onOverlayClick () {
  if (!props.persistent) emit('cerrar')
}

function onKeydown (e) {
  if (e.key === 'Escape' && !props.persistent) emit('cerrar')
}

onMounted(() => {
  // bloquear scroll del body mientras el modal esté abierto
  const previous = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  // cerrar con ESC
  window.addEventListener('keydown', onKeydown)

  // foco inicial al contenido para accesibilidad
  requestAnimationFrame(() => {
    contentRef.value?.focus?.()
  })

  // cleanup
  onBeforeUnmount(() => {
    document.body.style.overflow = previous
    window.removeEventListener('keydown', onKeydown)
  })
})

// si cambia el width dinámicamente, reflejar en estilo inline
watchEffect(() => {
  contentStyle.maxWidth = props.width
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;           /* margen interno para móviles */
  z-index: 1000;

  animation: fadeIn .25s ease forwards;
}

.modal-content {
  position: relative;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 1rem;
  padding: clamp(1rem, 4vw, 2rem);
  box-shadow: 0 12px 32px rgba(0,0,0,.25);

  animation: slideUp .25s ease forwards;
  outline: none; /* el foco lo ponemos con tabindex */
}

.modal-close {
  position: absolute;
  top: .6rem;
  right: .8rem;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
}

.modal-close:hover {
  color: #000;
  transform: scale(1.05);
}

@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(18px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
