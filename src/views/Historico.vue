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
import { ref, onMounted } from "vue"
import { db } from "../services/firebase"
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Trash2 } from "lucide-vue-next"

const historico = ref([])

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

onMounted(() => {
  const q = query(collection(db, "liquidacionesGuardadas"), orderBy("createdAt", "desc"))
  onSnapshot(q, (snapshot) => {
    historico.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
  })
})

// 🔹 Generar PDF a partir del snapshot guardado
function generarPDF(item) {
  if (!item) {
    alert("⚠️ No se encontró el detalle de esta liquidación")
    return
  }

  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("GUADIOLEO - LIQUIDACIÓN", 14, 20)

  doc.setFontSize(12)
  doc.text(`Contrato: ${item.contrato}`, 14, 30)
  doc.text(`Cliente: ${item.cliente}`, 14, 38)
  doc.text(`Fecha: ${item.fecha}`, 14, 46)
  doc.text(`Rol: ${item.rol}`, 14, 54)

  // Resumen principal
  autoTable(doc, {
    startY: 70,
    head: [["Kilos recibidos", "Kilos finales", "Precio base", "Precio final", "Importe final"]],
    body: [[
      item.kgRecibidos,
      item.kgFinal.toFixed(2),
      item.precioBase.toFixed(4) + " €/kg",
      item.precioFinal.toFixed(4) + " €/kg",
      item.importeFinal.toFixed(2) + " €"
    ]],
    styles: { halign: "center" },
    headStyles: { fillColor: [85, 107, 47] }
  })

  // Ajustes
  if (item.ajustes && item.ajustes.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Ajustes aplicados"]],
      body: item.ajustes.map(a => [a]),
      styles: { halign: "left" }
    })
  }

  doc.save(`liquidacion_${item.contrato || "sin_contrato"}.pdf`)
}
const mostrarModal = ref(false)
const detalleSeleccionado = ref(null)

function verDetalle(item) {
  detalleSeleccionado.value = item.resumen
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
