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
      <div class="form-group"><label>Entrega a cuenta (€)</label><input type="number" v-model.number="entregaCuenta" step="0.01" /></div>
      <div class="form-group"><label>IVA (%)</label><input type="number" v-model.number="ivaPorcentaje" step="0.01" /></div>
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
<Modal v-if="mostrarModal" @cerrar="cerrarModal" :width="'55rem'">
  <h2>📊 Resumen de Liquidación</h2>

  <!-- CABECERA -->
  <table class="resumen-table">
    <tr>
      <th>Boletín</th><td>{{ contrato }}</td>
      <th>Empresa</th><td>{{ cliente }}</td>
    </tr>
    <tr>
      <th>Fecha</th><td>{{ fecha }}</td>
      <th>Tipo</th><td>{{ tipoAceite.toUpperCase() }}</td>
    </tr>
    <tr>
      <th colspan="2">Precio Base</th>
      <td colspan="2">{{ precioBase.toFixed(4) }} €/kg</td>
    </tr>
  </table>

  <!-- VALORES INICIALES -->
  <h3>Analítica</h3>
  <table class="resumen-table">
    <thead>
      <tr>
        <th>Cantidad</th>
        <th>Acidez</th>
        <th>{{ tipoAceite === 'orujo' ? 'H+I+E.E' : 'H+I' }}</th>
        <th v-if="resumenDatos.baseCeras !== null">Ceras</th>
        <th v-if="resumenDatos.baseEritrodiol !== null">E+U</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ resumenDatos.kgRecibidos }}</td>
        <td>{{ acidez }}</td>
        <td>{{ resumenDatos.hiActual.toFixed(2) }}</td>
        <td v-if="resumenDatos.baseCeras !== null">{{ ceras }}</td>
        <td v-if="resumenDatos.baseEritrodiol !== null">{{ eritrodiol }}</td>
      </tr>
    </tbody>
  </table>

  <!-- REVERSIÓN Y EXCESOS -->
  <h3>Reversión y Excesos</h3>
  <table class="resumen-table">
    <thead>
      <tr>
        <th></th>
        <th>Acidez</th>
        <th>{{ tipoAceite === 'orujo' ? 'H+I+E.E' : 'H+I' }}</th>
        <th v-if="resumenDatos.baseCeras !== null">Ceras</th>
        <th v-if="resumenDatos.baseEritrodiol !== null">E+U</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bases y Tolerancias</td>
        <td>{{ resumenDatos.baseAcidez }}</td>
        <td>{{ resumenDatos.baseTol }}</td>
        <td v-if="resumenDatos.baseCeras !== null">{{ resumenDatos.baseCeras }}</td>
        <td v-if="resumenDatos.baseEritrodiol !== null">{{ resumenDatos.baseEritrodiol }}</td>
      </tr>
      <tr>
        <td>Excesos</td>
        <td>{{ resumenDatos.resAcidez.toFixed(2) }}</td>
        <td>{{ resumenDatos.resHI.toFixed(2) }}</td>
        <td v-if="resumenDatos.baseCeras !== null">{{ resumenDatos.resCeras.toFixed(2) }}</td>
        <td v-if="resumenDatos.baseEritrodiol !== null">{{ resumenDatos.resEritrodiol.toFixed(2) }}</td>
      </tr>
    </tbody>
  </table>

  <!-- DESCUENTOS €/kg -->
  <h3>Descuentos en Precio</h3>
  <table class="resumen-table">
    <thead>
      <tr>
        <th>Acidez (€/kg)</th>
        <th v-if="resumenDatos.descCeras !== null">Ceras (€/kg)</th>
        <th v-if="resumenDatos.descEritrodiol !== null">E+U (€/kg)</th>
        <th>Total (€/kg)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ resumenDatos.descAcidez.toFixed(6) }}</td>
        <td v-if="resumenDatos.descCeras !== null">{{ resumenDatos.descCeras.toFixed(6) }}</td>
        <td v-if="resumenDatos.descEritrodiol !== null">{{ resumenDatos.descEritrodiol.toFixed(6) }}</td>
        <td>{{ resumenDatos.descTotal.toFixed(6) }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th>Precio Base</th>
        <td colspan="2">{{ resumenDatos.precioBase.toFixed(4) }} €/kg</td>
        <th>Precio Final</th>
        <td>{{ resumenDatos.precioFinal.toFixed(4) }} €/kg</td>
      </tr>
    </tfoot>
  </table>

  <!-- DESCUENTOS EN KILOS -->
  <h3>Descuento en Kilos</h3>
  <table class="resumen-table">
    <tr><th>H+I</th><td>{{ resumenDatos.resHI.toFixed(2) }} %</td></tr>
    <tr><th>Cantidad inicial</th><td>{{ resumenDatos.kgRecibidos }}</td></tr>
    <tr><th>Descuento aplicado</th><td>{{ resumenDatos.descKgTol.toFixed(2) }}</td></tr>
    <tr><th>Total Kilos</th><td><b>{{ resumenDatos.kgFinal.toFixed(2) }}</b></td></tr>
  </table>

  <!-- LIQUIDACIÓN FINAL -->
  <h3>Liquidación Final</h3>
  <table class="resumen-table">
    <tr><th>Importe</th><td>{{ resumenDatos.importeFinal.toFixed(2) }} €</td></tr>
    <tr><th>IVA ({{ resumenDatos.ivaPorcentaje }})</th><td>{{ resumenDatos.iva.toFixed(2) }} €</td></tr>
    <tr><th>Total factura</th><td>{{ resumenDatos.totalFactura.toFixed(2) }} €</td></tr>
    <tr><th>Entrega a cuenta</th><td>{{ resumenDatos.entregaCuenta.toFixed(2) }} €</td></tr>
    <tr>
      <th>Saldo a favor / en contra</th>
      <td :style="{color: resumenDatos.saldo < 0 ? 'red' : 'green', fontWeight: 'bold'}">
        {{ resumenDatos.saldo.toFixed(2) }} €
      </td>
    </tr>
  </table>
</Modal>




  </section>
</template>

<script setup>
import { ref } from "vue";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/Guadioleo.png";

import Modal from "../components/Modal.vue";

// Datos principales
const contrato = ref("");
const cliente = ref("");
const fecha = ref(new Date().toISOString().split("T")[0]);
const tipoAceite = ref("orujo");
const modo = ref("auto");

const kg = ref(0);
const precioBase = ref(0);
const entregaCuenta = ref(0);
const ivaPorcentaje = ref(4);

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
  let descKgTol = 0;
  const ajustes = [];

  // 👉 nuevos acumuladores de descuentos (€/kg)
  let descAcidez = 0;
  let descCeras = 0;
  let descEritrodiol = 0;

  // Bases auto/manual (igual que tenías)
  const bases = {
    acidez: modo.value === "auto"
      ? (tipoAceite.value === "orujo" ? 10 : 1)
      : baseAcidez.value,

    tol: modo.value === "auto"
      ? (tipoAceite.value === "orujo" ? 2.15 : 0.30)
      : baseTol.value,

    ceras: modo.value === "auto" ? 120 : baseCeras.value,
    eritrodiol: modo.value === "auto" ? 2.5 : baseEritrodiol.value
  };

  // H+I para mostrar en tabla (en ORUJO auto incluye ésteres, como usas ahora)
  const hiActual = (tipoAceite.value === "orujo" && modo.value === "auto")
    ? (humedad.value + impurezas.value + esteres.value)
    : (humedad.value + impurezas.value);

  // === CÁLCULOS (respetando tu lógica actual) ===
  if (tipoAceite.value === "orujo") {
    const excesoTol = Math.max(0, (humedad.value + impurezas.value + esteres.value) - bases.tol);
    if (excesoTol > 0) {
      const descKg = (excesoTol / 100) * kg.value;
      kgFinal -= descKg;
      descKgTol += descKg;
      ajustes.push(`Tolerancia superada (${excesoTol.toFixed(2)}%) → -${descKg.toFixed(2)} kg`);
    }
    const excesoAc = acidez.value - bases.acidez;
    if (excesoAc !== 0) {
      const ajuste = precioBase.value * 0.02 * excesoAc; // €/kg
      precioFinal -= ajuste;
      if (ajuste > 0) descAcidez += ajuste;
      ajustes.push(`Reversión acidez (${excesoAc.toFixed(2)}) → -${ajuste.toFixed(4)} €/kg`);
    }
  }

  if (tipoAceite.value === "lampante") {
    const excesoTol = Math.max(0, (humedad.value + impurezas.value) - bases.tol);
    if (excesoTol > 0) {
      const descKg = (excesoTol / 100) * kg.value;
      kgFinal -= descKg;
      descKgTol += descKg;
      ajustes.push(`Tolerancia superada (${excesoTol.toFixed(2)}%) → -${descKg.toFixed(2)} kg`);
    }
    if (acidez.value > bases.acidez) {
      const exceso = acidez.value - bases.acidez;
      const ajuste = precioBase.value * 0.015 * exceso; // €/kg
      precioFinal -= ajuste;
      descAcidez += ajuste;
      ajustes.push(`Reversión Lampante (acidez ${exceso.toFixed(2)}) → -${ajuste.toFixed(4)} €/kg`);
    }
    if (ceras.value > bases.ceras) {
      const exceso = ceras.value - bases.ceras;
      const penal = (exceso / 100) * 60 / 1000; // €/kg
      precioFinal -= penal;
      descCeras += penal;
      ajustes.push(`Ceras exceso ${exceso} → -${penal.toFixed(4)} €/kg`);
    }
    if (eritrodiol.value > bases.eritrodiol) {
      const exceso = eritrodiol.value - bases.eritrodiol;
      const penal = (exceso * 40) / 1000; // €/kg
      precioFinal -= penal;
      descEritrodiol += penal;
      ajustes.push(`Eritrodiol exceso ${exceso.toFixed(2)} → -${penal.toFixed(4)} €/kg`);
    }
  }

  if (tipoAceite.value === "repaso") {
    const excesoTol = Math.max(0, (humedad.value + impurezas.value) - bases.tol);
    if (excesoTol > 0) {
      const descKg = (excesoTol / 100) * kg.value;
      kgFinal -= descKg;
      descKgTol += descKg;
      ajustes.push(`Tolerancia superada (${excesoTol.toFixed(2)}%) → -${descKg.toFixed(2)} kg`);
    }
    if (acidez.value > bases.acidez) {
      const exceso = acidez.value - bases.acidez;
      const ajuste = exceso * 0.03; // €/kg (30 €/t)
      precioFinal -= ajuste;
      descAcidez += ajuste;
      ajustes.push(`Reversión Repaso (acidez ${exceso.toFixed(2)}) → -${ajuste.toFixed(4)} €/kg`);
    }
    if (ceras.value > bases.ceras) {
      const exceso = ceras.value - bases.ceras;
      const penal = (exceso / 100) * 60 / 1000; // €/kg
      precioFinal -= penal;
      descCeras += penal;
      ajustes.push(`Ceras exceso ${exceso} → -${penal.toFixed(4)} €/kg`);
    }
    if (eritrodiol.value > bases.eritrodiol) {
      const exceso = eritrodiol.value - bases.eritrodiol;
      const penal = (exceso * 40) / 1000; // €/kg
      precioFinal -= penal;
      descEritrodiol += penal;
      ajustes.push(`Eritrodiol exceso ${exceso.toFixed(2)} → -${penal.toFixed(4)} €/kg`);
    }
  }

  // Totales económicos
  const importeFinal = precioFinal * kgFinal;
  const iva = importeFinal * (ivaPorcentaje.value / 100);
  const totalFactura = importeFinal + iva;
  const saldo = totalFactura - entregaCuenta.value;

  // Resultados (exceso sobre base) para la tabla de "REVERSIÓN / RESULTADOS"
  const resAcidez = Math.max(0, acidez.value - bases.acidez);
  const resHI = Math.max(0, hiActual - bases.tol);
  const resCeras = Math.max(0, ceras.value - bases.ceras);
  const resEritrodiol = Math.max(0, eritrodiol.value - bases.eritrodiol);

  resumenDatos.value = {
  contrato: contrato.value,
  cliente: cliente.value,
  fecha: fecha.value,
  tipo: tipoAceite.value,
  modo: modo.value,

  kgRecibidos: kg.value,
  kgFinal, // ✅ ya viene con descuentos aplicados
  precioBase: precioBase.value,
  precioFinal, // ✅ ya viene con descuentos aplicados

  importeFinal,
  iva,
  ivaPorcentaje: ivaPorcentaje.value,
  totalFactura,
  entregaCuenta: entregaCuenta.value,
  saldo,

  ajustes,

  // Bases y valores para maquetación
  baseAcidez: bases.acidez,
  baseTol: bases.tol,
  baseCeras: (tipoAceite.value === "orujo" && modo.value === "auto") ? null : bases.ceras,
  baseEritrodiol: (tipoAceite.value === "orujo" && modo.value === "auto") ? null : bases.eritrodiol,

  hiActual,

  // Excesos (RESULTADOS)
  resAcidez,
  resHI,
  resCeras: (tipoAceite.value === "orujo" && modo.value === "auto") ? null : resCeras,
  resEritrodiol: (tipoAceite.value === "orujo" && modo.value === "auto") ? null : resEritrodiol,

  // Descuentos por concepto
  descKgTol,
  descAcidez,
  descCeras: (tipoAceite.value === "orujo" && modo.value === "auto") ? null : descCeras,
  descEritrodiol: (tipoAceite.value === "orujo" && modo.value === "auto") ? null : descEritrodiol,
  descTotal: descAcidez + (descCeras || 0) + (descEritrodiol || 0)
};

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

  // === Logo centrado ===
  const pageWidth = doc.internal.pageSize.getWidth();
  const imgWidth = 25;   // ajusta según tu logo
  const imgHeight = 25;
  const imgX = (pageWidth - imgWidth) / 2;
  doc.addImage(logo, "PNG", imgX, 10, imgWidth, imgHeight);

// === Datos de la empresa centrados ===
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const direccion = "Glorieta Fernando Quiñones, 0 · Edificio Centris I, Oficina 1, 98-41940 Tomares (Sevilla)";
  doc.text(direccion, pageWidth / 2, 46, { align: "center" });

  // === Título debajo ===
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Informe Liquidación", pageWidth / 2, 60, { align: "center" });

  let y = 65; // empezamos tablas más abajo

 // --- CABECERA ---
  autoTable(doc, {
    startY: y,
    head: [["Contrato", "Cliente", "Fecha", "Tipo"]],
    body: [[
      resumenDatos.value.contrato,
      resumenDatos.value.cliente,
      resumenDatos.value.fecha,
      resumenDatos.value.tipo.toUpperCase()
    ]]
  });

  // --- Kg Finales y Precio Final ---
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Kg recibidos", "Kg finales", "Precio base (€/kg)", "Precio final (€/kg)"]],
    body: [[
      resumenDatos.value.kgRecibidos,
      resumenDatos.value.kgFinal.toFixed(2),
      resumenDatos.value.precioBase.toFixed(4),
      resumenDatos.value.precioFinal.toFixed(4)
    ]]
  });

  // --- Analítica ---
  if (resumenDatos.value.tipo === "orujo" && resumenDatos.value.modo === "auto") {
    // En orujo auto H+I+EE
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Cantidad", "Acidez", "H+I+E.E"]],
      body: [[
        resumenDatos.value.kgRecibidos,
        resumenDatos.value.acidez,
        resumenDatos.value.hiActual.toFixed(2)
      ], [
        "Base",
        resumenDatos.value.baseAcidez,
        resumenDatos.value.baseTol
      ], [
        "Resultado",
        resumenDatos.value.resAcidez.toFixed(2),
        resumenDatos.value.resHI.toFixed(2)
      ]]
    });
  } else {
    // Para lampante, repaso y orujo manual con bases
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Cantidad", "Acidez", "H+I", "Ceras", "E+U"]],
      body: [[
        resumenDatos.value.kgRecibidos,
        resumenDatos.value.acidez,
        resumenDatos.value.hiActual.toFixed(2),
        resumenDatos.value.ceras,
        resumenDatos.value.eritrodiol
      ], [
        "Base",
        resumenDatos.value.baseAcidez,
        resumenDatos.value.baseTol,
        resumenDatos.value.baseCeras,
        resumenDatos.value.baseEritrodiol
      ], [
        "Resultado",
        resumenDatos.value.resAcidez.toFixed(2),
        resumenDatos.value.resHI.toFixed(2),
        resumenDatos.value.resCeras.toFixed(2),
        resumenDatos.value.resEritrodiol.toFixed(2)
      ]]
    });
  }

  // --- Descuentos ---
  if (resumenDatos.value.tipo === "orujo" && resumenDatos.value.modo === "auto") {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Tolerancia (kg)", "Acidez (€/kg)", "Total €/kg"]],
      body: [[
        resumenDatos.value.descKgTol.toFixed(2),
        resumenDatos.value.descAcidez.toFixed(6),
        resumenDatos.value.descTotal.toFixed(6)
      ]]
    });
  } else {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Tolerancia (kg)", "Acidez (€/kg)", "Ceras (€/kg)", "E+U (€/kg)", "Total €/kg"]],
      body: [[
        resumenDatos.value.descKgTol.toFixed(2),
        resumenDatos.value.descAcidez.toFixed(6),
        resumenDatos.value.descCeras.toFixed(6),
        resumenDatos.value.descEritrodiol.toFixed(6),
        resumenDatos.value.descTotal.toFixed(6)
      ]]
    });
  }

  // --- Liquidación Final ---
autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 10,
  head: [["Concepto", "Importe"]],
  body: [
    ["Importe", resumenDatos.value.importeFinal.toFixed(2) + " €"],
    [`IVA (${resumenDatos.value.ivaPorcentaje}%)`, resumenDatos.value.iva.toFixed(2) + " €"],
    ["Total factura", resumenDatos.value.totalFactura.toFixed(2) + " €"],
    ["Entrega a cuenta", resumenDatos.value.entregaCuenta.toFixed(2) + " €"],
    ["Saldo a S/N favor", resumenDatos.value.saldo.toFixed(2) + " €"]
  ],
  didParseCell: function (data) {
    if (data.section === "body" && data.row.index === 4 && data.column.index === 1) {
      // fila 4 (Saldo), columna 1 (importe)
      if (resumenDatos.value.saldo < 0) {
        data.cell.styles.textColor = [200, 0, 0]; // rojo
      } else {
        data.cell.styles.textColor = [0, 150, 0]; // verde
      }
      data.cell.styles.fontStyle = "bold"; // en negrita
    }
  }
});


  // Guarda el PDF
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

/* === TABLAS RESUMEN === */
.resumen-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.resumen-table th,
.resumen-table td {
  border: 1px solid #999;
  padding: 0.6rem 0.8rem;
  text-align: center;
}

.resumen-table th {
  background: #f2f2f2;
  font-weight: 600;
}

.resumen-table tfoot th {
  background: #eaeaea;
  font-weight: 700;
}

</style>