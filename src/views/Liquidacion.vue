<template>
  <section class="liquidacion app-section">
    <h2>Realizar Liquidación</h2>

    <!-- Info general -->
    <div class="form-grid">
      <div class="form-group">
        <label>Nº Contrato</label>
        <input v-model="contrato" type="text" />
      </div>
      <div class="form-group">
        <label>Cliente/Proveedor</label>
        <input v-model="cliente" type="text" />
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input v-model="fecha" type="date" />
      </div>
    </div>

    <!-- Selección de tipo -->
    <div class="form-group">
      <label>Tipo de Aceite</label>
      <select v-model="tipoAceite">
        <option value="orujo">Orujo Crudo</option>
        <option value="lampante">Lampante</option>
        <option value="repaso">Repaso</option>
      </select>
    </div>

    <!-- Automática o personalizada -->
    <div class="form-group">
      <label>Modo</label>
      <select v-model="modo">
        <option value="auto">Automática</option>
        <option value="manual">Personalizada</option>
      </select>
    </div>

    <!-- Parámetros -->
    <div class="form-grid">
      <div class="form-group"><label>Kilos recibidos</label><input type="number" v-model.number="kg" step="0.01" /></div>
      <div class="form-group"><label>Precio Base (€/kg)</label><input type="number" v-model.number="precioBase" step="0.0001" /></div>
      <div class="form-group"><label>Acidez (%)</label><input type="number" v-model.number="acidez" step="0.01" /></div>
      <div class="form-group"><label>Humedad (%)</label><input type="number" v-model.number="humedad" step="0.01" /></div>
      <div class="form-group"><label>Impurezas (%)</label><input type="number" v-model.number="impurezas" step="0.01" /></div>
      <div class="form-group"><label>Ésteres (mg/kg)</label><input type="number" v-model.number="esteres" step="0.01" /></div>
      <div class="form-group"><label>Ceras (mg/kg)</label><input type="number" v-model.number="ceras" step="0.01" /></div>
      <div class="form-group"><label>Eritrodiol+Uvaol (%)</label><input type="number" v-model.number="eritrodiol" step="0.01" /></div>
    </div>

    <!-- Bases personalizadas si modo manual -->
<div v-if="modo === 'manual'" class="manual-box">
  <h3>Bases Personalizadas</h3>
  <div class="form-grid">
    <div class="form-group">
      <label>Base Acidez (%)</label>
      <input type="number" v-model.number="baseAcidez" step="0.01" />
    </div>
    <div class="form-group">
      <label>Base Tolerancia (%)</label>
      <input type="number" v-model.number="baseTol" step="0.01" />
    </div>
    <div class="form-group">
      <label>Base Ceras (mg/kg)</label>
      <input type="number" v-model.number="baseCeras" step="0.01" />
    </div>
    <div class="form-group">
      <label>Base Eritrodiol + Uvaol (%)</label>
      <input type="number" v-model.number="baseEritrodiol" step="0.01" />
    </div>
  </div>
</div>


    <!-- Botones -->
    <div class="btn-group">
      <button class="boton advertencia" @click="calcularLiquidacion">📊 Calcular</button>
      <button class="boton exito" @click="guardarLiquidacion">💾 Guardar</button>
      <button class="boton primario" @click="exportarPDF">📄 Exportar PDF</button>
      
    </div>
<router-link to="/home" class="btn-volver">← Volver</router-link>
<!-- Modal de resultado -->
<Modal v-if="mostrarModal" @cerrar="cerrarModal" :width="'42rem'">
  <h2>📊 Resumen de Liquidación</h2>
  <div v-html="resultado"></div>
  <div style="display:flex; gap:.75rem; margin-top:1rem; flex-wrap:wrap;">
    <button class="boton exito" @click="guardarLiquidacion">💾 Guardar</button>
    <button class="boton primario" @click="exportarPDF">📄 Exportar PDF</button>
  </div>
</Modal>


  </section>
</template>

<script setup>
import { ref } from "vue";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../components/Modal.vue";

// Datos principales
const contrato = ref("");
const cliente = ref("");
const fecha = ref(new Date().toISOString().split("T")[0]);
const tipoAceite = ref("orujo");
const modo = ref("auto");

const kg = ref(0);
const precioBase = ref(0);
const acidez = ref(0);
const humedad = ref(0);
const impurezas = ref(0);
const esteres = ref(0);
const ceras = ref(0);
const eritrodiol = ref(0);

// Bases (solo si manual)
const baseAcidez = ref(10);
const baseTol = ref(2.15);
const baseCeras = ref(120);
const baseEritrodiol = ref(2.5);

// Estado de resultado y modal
const resultado = ref("");
const mostrarModal = ref(false);

// Guardamos datos calculados para usar en PDF
const resumenDatos = ref(null);

// --- Calcular ---
function calcularLiquidacion() {
  let precioFinal = precioBase.value;
  let kgFinal = kg.value;
  const ajustes = [];

  // --- Usar bases automáticas o manuales ---
  const bases = {
  acidez: modo.value === "auto"
    ? (tipoAceite.value === "orujo" ? 10 : 1)
    : baseAcidez.value,

  tol: modo.value === "auto"
    ? (tipoAceite.value === "orujo" ? 2.15 : 0.30)
    : baseTol.value,  // ✅ aquí usamos el input manual

  ceras: modo.value === "auto" ? 120 : baseCeras.value,

  eritrodiol: modo.value === "auto" ? 2.5 : baseEritrodiol.value
};

  // --- Cálculos ---
  if (tipoAceite.value === "orujo") {
    const excesoTol = Math.max(0, (humedad.value + impurezas.value + esteres.value) - bases.tol);
    if (excesoTol > 0) {
      const descKg = (excesoTol / 100) * kg.value;
      kgFinal -= descKg;
      ajustes.push(`Tolerancia superada (${excesoTol.toFixed(2)}%) → -${descKg.toFixed(2)} kg`);
    }
    const excesoAc = acidez.value - bases.acidez;
    if (excesoAc !== 0) {
      const ajuste = precioBase.value * 0.02 * excesoAc;
      precioFinal -= ajuste;
      ajustes.push(`Reversión acidez (${excesoAc.toFixed(2)}) → -${ajuste.toFixed(4)} €/kg`);
    }
  }

  // 🔹 Lampante
if (tipoAceite.value === "lampante") {
  const excesoTol = Math.max(0, (humedad.value + impurezas.value) - bases.tol);
  if (excesoTol > 0) {
    const descKg = (excesoTol / 100) * kg.value;
    kgFinal -= descKg;
    ajustes.push(`Tolerancia superada (${excesoTol.toFixed(2)}%) → -${descKg.toFixed(2)} kg`);
  }

  // Reversión acidez: 1.5% del precio base por grado de exceso
  if (acidez.value > bases.acidez) {
    const exceso = acidez.value - bases.acidez;
    const ajuste = precioBase.value * 0.015 * exceso;
    precioFinal -= ajuste;
    ajustes.push(`Reversión Lampante (acidez ${exceso.toFixed(2)}) → -${ajuste.toFixed(4)} €/kg`);
  }

  if (ceras.value > bases.ceras) {
    const exceso = ceras.value - bases.ceras;
    const penal = (exceso / 100) * 60 / 1000;
    precioFinal -= penal;
    ajustes.push(`Ceras exceso ${exceso} → -${penal.toFixed(4)} €/kg`);
  }

  if (eritrodiol.value > bases.eritrodiol) {
    const exceso = eritrodiol.value - bases.eritrodiol;
    const penal = (exceso * 40) / 1000;
    precioFinal -= penal;
    ajustes.push(`Eritrodiol exceso ${exceso.toFixed(2)} → -${penal.toFixed(4)} €/kg`);
  }
}

// 🔹 Repaso
if (tipoAceite.value === "repaso") {
  const excesoTol = Math.max(0, (humedad.value + impurezas.value) - bases.tol);
  if (excesoTol > 0) {
    const descKg = (excesoTol / 100) * kg.value;
    kgFinal -= descKg;
    ajustes.push(`Tolerancia superada (${excesoTol.toFixed(2)}%) → -${descKg.toFixed(2)} kg`);
  }

  // Reversión acidez: 30 €/t (0.03 €/kg) por grado de exceso
  if (acidez.value > bases.acidez) {
    const exceso = acidez.value - bases.acidez;
    const ajuste = exceso * 0.03; // €/kg
    precioFinal -= ajuste;
    ajustes.push(`Reversión Repaso (acidez ${exceso.toFixed(2)}) → -${ajuste.toFixed(4)} €/kg`);
  }

  if (ceras.value > bases.ceras) {
    const exceso = ceras.value - bases.ceras;
    const penal = (exceso / 100) * 60 / 1000;
    precioFinal -= penal;
    ajustes.push(`Ceras exceso ${exceso} → -${penal.toFixed(4)} €/kg`);
  }

  if (eritrodiol.value > bases.eritrodiol) {
    const exceso = eritrodiol.value - bases.eritrodiol;
    const penal = (exceso * 40) / 1000;
    precioFinal -= penal;
    ajustes.push(`Eritrodiol exceso ${exceso.toFixed(2)} → -${penal.toFixed(4)} €/kg`);
  }
}


  const importeFinal = precioFinal * kgFinal;

  // Guardamos en objeto resumen
  resumenDatos.value = {
    contrato: contrato.value,
    cliente: cliente.value,
    fecha: fecha.value,
    tipo: tipoAceite.value,
    modo: modo.value,
    kgRecibidos: kg.value,
    kgFinal,
    precioBase: precioBase.value,
    precioFinal,
    importeFinal,
    ajustes
  };

  // Mostramos en modal
  resultado.value = `
    <h3>Resumen de Liquidación</h3>
    <p><strong>Contrato:</strong> ${contrato.value} | <strong>Cliente:</strong> ${cliente.value} | <strong>Fecha:</strong> ${fecha.value}</p>
    <p><strong>Tipo:</strong> ${tipoAceite.value.toUpperCase()} | <strong>Modo:</strong> ${modo.value === "auto" ? "Automática" : "Manual"}</p>
    <p><strong>Kilos recibidos:</strong> ${kg.value}</p>
    <p><strong>Kilos finales:</strong> ${kgFinal.toFixed(2)}</p>
    <p><strong>Precio base:</strong> ${precioBase.value.toFixed(4)} €/kg</p>
    <p><strong>Precio final:</strong> ${precioFinal.toFixed(4)} €/kg</p>
    <p><strong>Importe final:</strong> ${importeFinal.toFixed(2)} €</p>
    <hr/>
    <h4>Ajustes aplicados:</h4>
    <ul>${ajustes.map(a => `<li>${a}</li>`).join("")}</ul>
  `;
  mostrarModal.value = true;
}

// --- Cerrar Modal ---
function cerrarModal() {
  mostrarModal.value = false;
}
const rolUsuario = localStorage.getItem("rol") || "Usuario";
// --- Guardar ---
async function guardarLiquidacion() {
  try {
    const user = auth.currentUser;
    if (!user) return alert("Debes iniciar sesión");
    await addDoc(collection(db, "liquidacionesGuardadas"), {
      ...resumenDatos.value,
      resumen: resultado.value,
      rol: rolUsuario,
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
    alert("✅ Liquidación guardada en Firestore");
  } catch (e) { console.error("❌ Error guardando:", e); }
}

// --- PDF ---
function exportarPDF() {
  if (!resumenDatos.value) {
    alert("⚠️ Primero calcula la liquidación");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Liquidación - Guadioleo", 14, 20);

  // Cabecera
  autoTable(doc, {
    startY: 30,
    head: [["Contrato", "Cliente", "Fecha", "Tipo"]],
    body: [[
      resumenDatos.value.contrato,
      resumenDatos.value.cliente,
      resumenDatos.value.fecha,
      resumenDatos.value.tipo
    ]],
  });

  // Resumen principal
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Kilos recibidos", "Kilos finales", "Precio base", "Precio final", "Importe final"]],
    body: [[
      resumenDatos.value.kgRecibidos,
      resumenDatos.value.kgFinal.toFixed(2),
      resumenDatos.value.precioBase.toFixed(4) + " €/kg",
      resumenDatos.value.precioFinal.toFixed(4) + " €/kg",
      resumenDatos.value.importeFinal.toFixed(2) + " €"
    ]],
  });

  // Ajustes
  if (resumenDatos.value.ajustes.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Ajustes aplicados"]],
      body: resumenDatos.value.ajustes.map(a => [a]),
    });
  }

  doc.save(`liquidacion_${resumenDatos.value.contrato}.pdf`);
}
</script>


<style scoped>
.liquidacion {
  max-width: 70rem;
  margin: auto;
  padding: clamp(1rem, 4vw, 2rem) 1rem;
}

/* título con un poco de respiro */
.app-section h2 { margin-bottom: 1rem; }

/* === FORM === */
.form-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(14rem,1fr)); /* un poco más ancho por campo */
  gap:1rem 1.25rem;        /* ↑ más separación entre columnas y filas */
  margin-bottom:1rem;
}
.form-group{ margin:0; }   /* lo gestiona el gap del grid */

.form-group label{
  display:block;
  margin-bottom:.45rem;    /* aire entre label y control */
  font-weight:600;
  font-size:clamp(.9rem,2.5vw,1rem);
  color:#2f3d1e;
}

/* altura unificada para inputs y selects */
.form-group input,
.form-group select{
  width:100%;
  box-sizing:border-box;
  height:44px;             /* 👈 misma altura */
  padding:0 .8rem;
  border:1px solid #d6d6d6;
  border-radius:.55rem;
  font-size:1rem;
  background:#fff;
  transition:border-color .2s, box-shadow .2s, background .2s;
}

/* focus claro */
.form-group input:focus,
.form-group select:focus{
  border-color:var(--color-olive-dark);
  outline:none;
  box-shadow:0 0 0 3px rgba(85,107,47,.18);
}

/* quita spinners de number */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }
input[type="number"]{ -moz-appearance:textfield; }

.manual-box{
  margin:1rem 0 .5rem;
  padding:1rem;
  border:1px solid #e5e7eb;
  border-radius:.6rem;
  background:#fafafa;
}

/* === BOTONERA === */
.btn-group{
  display:flex;
  flex-wrap:wrap;
  gap:.9rem;               /* aire entre botones */
  margin-top:1rem;
}

/* hace que los botones tengan misma altura que los inputs */
.boton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:.5rem;
  min-width:12rem;
  height:44px;             /* 👈 igual que inputs */
  padding:0 1.2rem;
  border:none;
  border-radius:.6rem;
  font-weight:600;
  font-size:1rem;
  cursor:pointer;
  transition:transform .2s, background .2s, color .2s;
}

/* armoniza el router-link de Volver con los botones */
.btn-volver {
  display: block;
  width: 90%;
  max-width: 16rem;
  margin: 1rem auto;
  text-align: center;
  background: var(--color-olive-dark);
  color: white;
  padding: 0.7rem 1rem;
  border-radius: 0.6rem;
  font-weight: 600;
  text-decoration: none;
}

.btn-volver:hover {
  opacity: 0.9;
}

/* hover coherente con tu base.css */
.boton:hover,
.btn-volver:hover{
  transform:translateY(-1px);
}

/* 📱 Mobile */
@media (max-width:480px){
  .form-grid{ grid-template-columns:1fr; }
  .btn-group{ flex-direction:column; }
  .boton { 
  min-width:unset; 
  width:100%;
   }
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  animation: fadeIn 0.3s ease forwards;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 42rem;
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);

  animation: slideUp 0.3s ease forwards;
}

.modal-close {
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

</style>