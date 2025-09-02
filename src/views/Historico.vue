<template>
  <section class="app-section">
    <h2>Histórico de Liquidaciones</h2>

    <table class="historico-tabla" v-if="historico.length">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Rol</th>
          <th>Detalle</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in historico" :key="item.id">
          <td data-label="Fecha">{{ formatearFecha(item.createdAt) }}</td>
          <td data-label="Rol">{{ item.rol }}</td>
          <td data-label="Detalle">{{ item.detalle }}</td>
          <td data-label="Acciones">
            <div class="acciones">
              <button class="boton primario" @click="verDetalle(item)">Ver detalle</button>
              <button class="boton advertencia" @click="generarPDF(item)">PDF</button>
              <button class="boton peligro" @click="eliminarItem(item.id, 'liquidacionesGuardadas')">
                <Trash2 size="16" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No hay liquidaciones guardadas todavía.</p>
      
      
      <!-- Modal de detalle -->
      <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-content">
          <button class="modal-close" @click="cerrarModal">x</button>
          <div v-html="detalleSeleccionado"></div>
        </div>
      </div>
    <!-- 🔙 Botón Volver -->
    <button class="btn-volver" @click="$router.push('/home')">
      ← Volver al menú
    </button>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { db } from "../services/firebase"
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { jsPDF } from "jspdf"
import { Trash2 } from "lucide-vue-next"

const historico = ref([])
const mostrarModal = ref(false)
const detalleSeleccionado = ref(null)

// 🔹 Formatear fecha desde Firestore Timestamp
function formatearFecha(fecha) {
  if (!fecha) return "-"
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

let unsubscribe = null // referencia al listener

onMounted(() => {
  const q = query(collection(db, "liquidacionesGuardadas"), orderBy("createdAt", "desc"))
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      historico.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    },
    (error) => {
      console.warn("❌ Error en listener:", error.message)
    }
  )
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
})

// 🔹 Generar PDF desde el HTML guardado
import autoTable from "jspdf-autotable";
import logo from "../assets/Guadioleo.png";

async function generarPDF(item) {
  if (!item) {
    alert("⚠️ No se encontró la liquidación");
    return;
  }

  const doc = new jsPDF();

  // === Logo ===
  const pageWidth = doc.internal.pageSize.getWidth();
  const imgWidth = 25;
  const imgHeight = 25;
  const imgX = (pageWidth - imgWidth) / 2;
  doc.addImage(logo, "PNG", imgX, 10, imgWidth, imgHeight);

  // === Datos de empresa ===
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const direccion = "Glorieta Fernando Quiñones, 0 · Edificio CENTRIS I, Oficina 1,98 · 41940, Tomares (Sevilla)";
  doc.text(direccion, pageWidth / 2, 46, { align: "center" });

  // === Título ===
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Informe Liquidación", pageWidth / 2, 60, { align: "center" });

  let y = 65;

  // --- Cabecera
  autoTable(doc, {
    startY: y,
    head: [["Contrato", "Cliente", "Fecha", "Tipo"]],
    body: [[item.contrato, item.cliente, item.fecha, item.tipo?.toUpperCase()]],
  });

  // --- Kg y precio
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Kg recibidos", "Kg finales", "Precio base (€/kg)", "Precio final (€/kg)"]],
    body: [[
      item.kgRecibidos,
      item.kgFinal.toFixed(2),
      item.precioBase.toFixed(4),
      item.precioFinal.toFixed(4),
    ]],
  });

  // --- Analítica (según tipo)
  if (item.tipo === "orujo" && item.modo === "auto") {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Cantidad", "Acidez", "H+I+E.E"]],
      body: [[
        item.kgRecibidos,
        item.acidez,
        item.hiActual.toFixed(2),
      ], [
        "Base", item.baseAcidez, item.baseTol
      ], [
        "Resultado", item.resAcidez.toFixed(2), item.resHI.toFixed(2)
      ]],
    });
  } else {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Cantidad", "Acidez", "H+I", "Ceras", "E+U"]],
      body: [[
        item.kgRecibidos,
        item.acidez,
        item.hiActual.toFixed(2),
        item.ceras,
        item.eritrodiol,
      ], [
        "Base",
        item.baseAcidez,
        item.baseTol,
        item.baseCeras,
        item.baseEritrodiol
      ], [
        "Resultado",
        item.resAcidez.toFixed(2),
        item.resHI.toFixed(2),
        item.resCeras?.toFixed(2) ?? "-",
        item.resEritrodiol?.toFixed(2) ?? "-"
      ]],
    });
  }

  // --- Descuentos
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Tolerancia (kg)", "Acidez (€/kg)", "Ceras (€/kg)", "E+U (€/kg)", "Total €/kg"]],
    body: [[
      item.descKgTol.toFixed(2),
      item.descAcidez.toFixed(6),
      item.descCeras?.toFixed(6) ?? "-",
      item.descEritrodiol?.toFixed(6) ?? "-",
      item.descTotal.toFixed(6),
    ]],
  });

  // --- Liquidación Final
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Concepto", "Importe"]],
    body: [
      ["Importe", item.importeFinal.toFixed(2) + " €"],
      [`IVA (${item.ivaPorcentaje}%)`, item.iva.toFixed(2) + " €"],
      ["Total factura", item.totalFactura.toFixed(2) + " €"],
      ["Entrega a cuenta", item.entregaCuenta.toFixed(2) + " €"],
      ["Saldo a S/N favor", item.saldo.toFixed(2) + " €"],
    ],
    didParseCell: function (data) {
      if (data.section === "body" && data.row.index === 4 && data.column.index === 1) {
        if (item.saldo < 0) {
          data.cell.styles.textColor = [200, 0, 0]; // rojo
        } else {
          data.cell.styles.textColor = [0, 150, 0]; // verde
        }
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save(`liquidacion_${item.contrato || "sin_contrato"}.pdf`);
}



function verDetalle(item) {
  detalleSeleccionado.value = item.htmlResumen || "No hay resumen guardado"
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  detalleSeleccionado.value = null
}

async function eliminarItem(id, coleccion) {
  if (!confirm("¿Seguro que deseas eliminar esta liquidación?")) return
  try {
    await deleteDoc(doc(db, coleccion, id))
    alert("✅ Liquidación eliminada correctamente")
  } catch (e) {
    console.error("❌ Error eliminando:", e)
    alert("Error eliminando la liquidación")
  }
}
</script>


<style scoped>
.historico-tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.historico-tabla th,
.historico-tabla td {
  padding: 0.8rem;
  text-align: center;
  border-bottom: 1px solid #ddd;
  font-size: 0.95rem;
}

.historico-tabla th {
  background: var(--color-olive-dark);
  color: #fff;
}

.historico-tabla tr:hover {
  background: #f1f5f9;
}

/* 📱 Responsivo: tabla como tarjetas */
@media (max-width: 768px) {
  .historico-tabla,
  .historico-tabla thead,
  .historico-tabla tbody,
  .historico-tabla th,
  .historico-tabla td,
  .historico-tabla tr {
    display: block;
    width: 100%;
  }

  .historico-tabla thead {
    display: none; /* ocultamos cabecera */
  }

  .historico-tabla tr {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 0.8rem;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }

  .historico-tabla td {
    text-align: left;
    border: none;
    padding: 0.4rem 0;
    font-size: 0.9rem;
  }

  .historico-tabla td::before {
    content: attr(data-label);
    font-weight: bold;
    display: block;
    margin-bottom: 0.2rem;
    color: var(--color-olive-dark);
  }

  td .boton {
    width: 100%;
    margin: 0.3rem 0;
    gap: 1rem;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 45rem;
  width: 100%;
  max-height: 90vh; /* ✅ scroll si es muy largo */
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
acciones{
  display:flex;
  gap: 1rem;          /* 👈 separa botones */
  justify-content:center;
  align-items:center;
  flex-wrap:wrap;     /* por si no caben en una línea */
}
.acciones .boton{
  padding:.5rem .9rem;
}
@media (max-width: 768px){
  .acciones{
    flex-direction:column;
    align-items:stretch;
  }
  .acciones .boton{
    width:100%;
  }
}
</style>
