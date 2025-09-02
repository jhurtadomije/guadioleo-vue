<template>
  <section class="app-section">
    <h2>⚙️ Configuración de Lotes</h2>

    <!-- Partidas -->
    <div v-for="(partida, index) in partidas" :key="partida.id" class="lote-card">
      <h3>📦 Partida {{ index + 1 }}</h3>

      <div class="grid">
        <div class="form-group"><label>Kilos</label><input v-model.number="partida.kilos" type="number" step="0.01" /></div>
        <div class="form-group"><label>Acidez (%)</label><input v-model.number="partida.acidez" type="number" step="0.01" /></div>
        <div class="form-group"><label>Humedad (%)</label><input v-model.number="partida.humedad" type="number" step="0.01" /></div>
        <div class="form-group"><label>Impurezas (%)</label><input v-model.number="partida.impurezas" type="number" step="0.01" /></div>
        <div class="form-group"><label>Ceras (%)</label><input v-model.number="partida.ceras" type="number" step="0.01" /></div>
        <div class="form-group"><label>Eritrodiol + Uvaol (%)</label><input v-model.number="partida.eritrodiol" type="number" step="0.01" /></div>
        <div class="form-group"><label>Ésteres Etílicos (mg/kg)</label><input v-model.number="partida.esteres" type="number" step="0.01" /></div>
        <div class="form-group"><label>Precio (€/kg)</label><input v-model.number="partida.precio" type="number" step="0.01" /></div>
        <div class="form-group">
          <label>Tipo de Aceite</label>
          <select v-model="partida.tipoAceite">
            <option disabled value="">Seleccionar...</option>
            <option value="lampante">Lampante</option>
            <option value="orujo">Orujo crudo</option>
            <option value="repaso">Repaso</option>
          </select>
        </div>
        <div class="form-group">
          <label>Procedencia</label>
          <input v-model="partida.procedencia" type="text" placeholder="Ej. Finca Olivares" />
        </div>
      </div>

      <button class="boton peligro" @click="eliminarPartida(index)">🗑 Eliminar</button>
    </div>

    <div class="acciones">
      <button class="boton advertencia" @click="agregarPartida">+ Añadir Partida</button>
      <button class="boton primario" @click="calcularComposicion">📊 Calcular Composición</button>
    </div>

    <!-- Resultados -->
    <Modal v-if="mostrarModal" @cerrar="mostrarModal=false">
      <h2>📊 Resumen de Composición</h2>
      <div v-html="resultadoHtml"></div>
      <button class="boton exito" @click="abrirModalGuardar">💾 Guardar Composición</button>

    </Modal>

<!-- Modal para título -->
    <Modal v-if="mostrarGuardar" @cerrar="mostrarGuardar=false">
      <h3>Guardar Lote</h3>
      <input v-model="tituloLote" type="text" placeholder="Introduce un título" />
      <div class="acciones">
        <button class="boton exito" @click="guardarComposicion">✅ Guardar</button>
        <button class="boton peligro" @click="mostrarGuardar=false">❌ Cancelar</button>
      </div>
    </Modal>

    <!-- 🔙 Botón Volver -->
    <button class="btn-volver" @click="$router.push('/home')">
      ← Volver al menú
    </button>
  </section>
</template>

<script setup>
import { ref } from "vue";
import Modal from "../components/Modal.vue";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const partidas = ref([]);
const mostrarModal = ref(false);
const resultadoHtml = ref("");

// 🔹 refs para guardar con título
const mostrarGuardar = ref(false);
const tituloLote = ref("");

function agregarPartida() {
  partidas.value.push({
    id: Date.now(),
    kilos: 0,
    acidez: 0,
    humedad: 0,
    impurezas: 0,
    ceras: 0,
    eritrodiol: 0,
    esteres: 0,
    precio: 0,
    tipoAceite: "",
    procedencia: ""
  });
}

function eliminarPartida(index) {
  partidas.value.splice(index, 1);
}

function calcularComposicion() {
  const totalKg = partidas.value.reduce((sum, p) => sum + p.kilos, 0);
  if (totalKg <= 0) {
    resultadoHtml.value = "<p class='error'>Introduce kilos válidos.</p>";
    mostrarModal.value = true;
    return;
  }

  const medias = {
    acidez: 0, humedad: 0, impurezas: 0,
    ceras: 0, eritrodiol: 0, esteres: 0, precio: 0
  };

  let detallePartidas = "";

  partidas.value.forEach((p, idx) => {
    medias.acidez += p.acidez * p.kilos;
    medias.humedad += p.humedad * p.kilos;
    medias.impurezas += p.impurezas * p.kilos;
    medias.ceras += p.ceras * p.kilos;
    medias.eritrodiol += p.eritrodiol * p.kilos;
    medias.esteres += p.esteres * p.kilos;
    medias.precio += p.precio * p.kilos;

    detallePartidas += `
      <div class="detalle-partida">
        <h4>Partida ${idx + 1}</h4>
        <ul>
          <li><strong>Kilos:</strong> ${p.kilos} kg</li>
          <li><strong>Tipo de Aceite:</strong> ${p.tipoAceite}</li>
          <li><strong>Procedencia:</strong> ${p.procedencia}</li>
          <li><strong>Acidez:</strong> ${p.acidez}%</li>
          <li><strong>Humedad:</strong> ${p.humedad}%</li>
          <li><strong>Impurezas:</strong> ${p.impurezas}%</li>
          <li><strong>Ceras:</strong> ${p.ceras}%</li>
          <li><strong>Eritrodiol+Uvaol:</strong> ${p.eritrodiol}%</li>
          <li><strong>Ésteres Etílicos:</strong> ${p.esteres} mg/kg</li>
          <li><strong>Precio:</strong> ${p.precio} €/kg</li>
        </ul>
      </div>
    `;
  });

  const resumen = `
    <h3>📊 Composición Final</h3>
    <p><strong>Total Kg:</strong> ${totalKg.toFixed(2)} kg</p>
    <ul>
      <li>Acidez media: <strong>${(medias.acidez / totalKg).toFixed(2)}%</strong></li>
      <li>Humedad media: <strong>${(medias.humedad / totalKg).toFixed(2)}%</strong></li>
      <li>Impurezas media: <strong>${(medias.impurezas / totalKg).toFixed(2)}%</strong></li>
      <li>Ceras media: <strong>${(medias.ceras / totalKg).toFixed(2)}%</strong></li>
      <li>Eritrodiol+Uvaol medio: <strong>${(medias.eritrodiol / totalKg).toFixed(2)}%</strong></li>
      <li>Ésteres Etílicos medio: <strong>${(medias.esteres / totalKg).toFixed(2)} mg/kg</strong></li>
      <li>Precio medio: <strong>${(medias.precio / totalKg).toFixed(2)} €/kg</strong></li>
    </ul>
  `;

  resultadoHtml.value = detallePartidas + "<hr/>" + resumen;
  mostrarModal.value = true;
}

const rolUsuario = localStorage.getItem("rol") || "Usuario";

function abrirModalGuardar() {
  mostrarGuardar.value = true;
  tituloLote.value = "";
}

async function guardarComposicion() {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para guardar.");
      return;
    }

    const totalKg = partidas.value.reduce((sum, p) => sum + p.kilos, 0);
    const totalPrecio = partidas.value.reduce((sum, p) => sum + (p.precio * p.kilos), 0);
    const precioMedio = totalKg > 0 ? (totalPrecio / totalKg) : 0;

    await addDoc(collection(db, "lotesGuardados"), {
      partidas: partidas.value,
      resumen: resultadoHtml.value,
      titulo: tituloLote.value || "Lote sin título",
      rol: rolUsuario,
      uid: user.uid,
      kg: totalKg,
      precio: precioMedio,
      fecha: serverTimestamp()
    });

    alert("✅ Lote completo guardado en la base de datos");
    mostrarGuardar.value = false;
    mostrarModal.value = false;
  } catch (e) {
    console.error("Error al guardar:", e);
    alert("❌ Error al guardar el lote");
  }
}
</script>



<style scoped>
.lote-card {
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 3px 8px rgba(0,0,0,0.08);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}

.acciones {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detalle-partida {
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.detalle-partida h4 {
  margin: 0 0 0.5rem;
  color: var(--color-olive-dark);
}

.detalle-partida ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.95rem;
}

.detalle-partida li {
  margin-bottom: 0.2rem;
}

/* 📱 Responsivo */
@media (max-width: 600px) {
  .acciones {
    flex-direction: column;
  }
  .lote-card {
    padding: 1rem;
  }
}
</style>
