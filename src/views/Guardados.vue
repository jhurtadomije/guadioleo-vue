<template>
  <section class="app-section">
    <h2>Lotes Guardados</h2>

    <ul v-if="lotes.length" class="lotes-list">
      <li v-for="(lot, idx) in lotes" :key="lot.id" class="guardado-card">
        <h3>#{{ idx + 1 }} - {{ lot.titulo }}</h3>
        <p><strong>Kg:</strong> {{ lot.kg || "N/A" }}</p>
        <p><strong>Precio:</strong> {{ lot.precio }} €/kg</p>
        <p><small>Guardado por: {{ lot.rol }}</small></p>

        <div class="acciones">
          <button class="boton primario" @click="verDetalle(lot)">Ver</button>
          <button class="boton advertencia" @click="exportarPDF(lot)">Exportar PDF</button>
          <button class="boton peligro" @click="eliminarItem(lot.id, 'lotesGuardados')">
            <Trash2 size="16" />
          </button>
        </div>
      </li>
    </ul>

    <!-- Estado vacío como en Histórico -->
    <div v-else class="empty-state">
      <p>No hay lotes guardados todavía.</p>
      <button class="btn-volver" @click="$router.push('/home')">
        ← Volver al menú
      </button>
    </div>

    <!-- Modal -->
    <Modal v-if="mostrarModal" @cerrar="mostrarModal = false">
      <template #default>
        <h2>{{ loteSeleccionado.titulo }}</h2>
        <div v-if="loteSeleccionado">
          <div v-html="loteSeleccionado.resumen"></div>
          <hr />
          <div v-if="loteSeleccionado.partidas?.length">
            <h3>📦 Partidas incluidas</h3>
            <div v-for="(p, idx) in loteSeleccionado.partidas" :key="idx" class="detalle-partida">
              <!-- …lista de campos… -->
            </div>
          </div>
          <hr />
          <p><strong>Creado por:</strong> {{ loteSeleccionado.rol }}</p>
          <p><strong>Fecha:</strong> {{ formatearFecha(loteSeleccionado.fecha) }}</p>
        </div>
      </template>
    </Modal>
  </section>
</template>



<script setup>
import { ref, onMounted } from "vue";
import { db } from "../services/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import Modal from "../components/Modal.vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const lotes = ref([]);
const mostrarModal = ref(false);
const loteSeleccionado = ref(null);
import { Trash2 } from "lucide-vue-next"

onMounted(() => {
  const q = query(collection(db, "lotesGuardados"), orderBy("fecha", "desc"));
  onSnapshot(q, (snapshot) => {
    lotes.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
});
function exportarPDF(lote) {
  if (!lote) {
    alert("⚠️ No se encontró el detalle de este lote");
    return;
  }

  const doc = new jsPDF();

  // Título
  doc.setFontSize(18);
  doc.text("GUADIOLEO - LOTE", 14, 20);

  // Cabecera
  doc.setFontSize(12);
  doc.text(`Título: ${lote.titulo || "Sin título"}`, 14, 30);
  doc.text(`Rol: ${lote.rol || "-"}`, 14, 38);
  doc.text(`Fecha: ${formatearFecha(lote.fecha)}`, 14, 46);

  // Totales
  autoTable(doc, {
    startY: 60,
    head: [["Kilos totales", "Precio medio"]],
    body: [[
      (lote.kg || 0).toFixed(2),
      (lote.precio || 0).toFixed(2) + " €/kg"
    ]],
    styles: { halign: "center" },
    headStyles: { fillColor: [85, 107, 47] }
  });

  // Partidas
  if (lote.partidas && lote.partidas.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["#", "Kilos", "Precio", "Acidez", "Humedad", "Impurezas", "Ceras", "Eritrodiol", "Ésteres"]],
      body: lote.partidas.map((p, idx) => [
        idx + 1,
        p.kilos,
        p.precio,
        p.acidez,
        p.humedad,
        p.impurezas,
        p.ceras,
        p.eritrodiol,
        p.esteres
      ]),
      styles: { fontSize: 9, halign: "center" },
      headStyles: { fillColor: [200, 200, 200] }
    });
  }

  const nombre = lote.titulo 
    ? lote.titulo.replace(/\s+/g, "_") 
    : `lote_${lote.id}`;
  doc.save(`${nombre}.pdf`);
}
async function eliminarItem(id, coleccion) {
  if (!confirm("¿Seguro que quieres eliminar este registro?")) return;

  try {
    await deleteDoc(doc(db, coleccion, id));
    alert("✅ Eliminado correctamente");
  } catch (e) {
    console.error("❌ Error al eliminar:", e);
    alert("Error al eliminar");
  }
}
function verDetalle(lot) {
  loteSeleccionado.value = lot;
  mostrarModal.value = true;
}

function formatearFecha(fecha) {
  if (!fecha) return "-";
  return fecha.toDate
    ? fecha.toDate().toLocaleString("es-ES")
    : new Date(fecha).toLocaleString("es-ES");
}
</script>

<style scoped>
.saved-lotes {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 0.75rem;
  box-shadow: 0 3px 6px rgba(0,0,0,0.05);
}

.guardado-card {
  background: #fff;
  padding: 1.2rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  margin-bottom: 1rem;
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
  .acciones .boton {
    flex: 1 1 100%;
    width: 100%;
  }
  .guardado-card {
    padding: 1rem;
  }
}
</style>
