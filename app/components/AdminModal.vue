<script setup lang="ts">
import type { CestaItem } from '../../shared/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ cerrar: [] }>()

const auth = useAuthStore()
const { apiFetch } = useApi()
const { mostrarToast } = useToast()

const nuevoLimite = ref(auth.limiteSemanal)
const guardando = ref(false)
const cargando = ref(true)
const error = ref('')

type ResumenUsuario = Record<string, { cartas: CestaItem[]; grupo: string }>
const resumen = ref<ResumenUsuario>({})

async function cargar() {
  nuevoLimite.value = auth.limiteSemanal
  cargando.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ porUsuario: ResumenUsuario }>('/api/admin/resumen')
    resumen.value = res.porUsuario
  } catch {
    error.value = 'Error al cargar los pedidos.'
  } finally {
    cargando.value = false
  }
}

watch(() => props.visible, (v) => { if (v) cargar() })

async function guardarLimite() {
  if (!nuevoLimite.value || nuevoLimite.value < 1) {
    return mostrarToast('Introduce un número válido.')
  }
  guardando.value = true
  try {
    await apiFetch('/api/config', { method: 'POST', body: { limiteSemanal: nuevoLimite.value } })
    auth.limiteSemanal = nuevoLimite.value
    mostrarToast(`Límite actualizado a ${nuevoLimite.value} cartas ✔`, 'var(--verde-ok)')
  } catch {
    mostrarToast('Error al guardar el límite.')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-box modal-box-wide slide-up">
      <div class="modal-header">
        <h3>⚙️ Panel de Admin — El99</h3>
        <button type="button" class="modal-close" @click="emit('cerrar')">✕</button>
      </div>

      <div class="admin-config">
        <label class="admin-config-label">🎚️ Límite semanal de cartas por usuario:</label>
        <div class="admin-config-row">
          <input v-model.number="nuevoLimite" type="number" class="qty-input" style="width:90px;" min="1" max="200">
          <button type="button" class="btn-primary" style="width:auto; padding: 10px 20px;" :disabled="guardando" @click="guardarLimite">
            Guardar
          </button>
        </div>
      </div>

      <h4 class="admin-section-title">📦 Pedidos de esta semana</h4>
      <div>
        <p v-if="cargando" class="empty-state admin-empty">Cargando pedidos de la semana...</p>
        <p v-else-if="error" class="empty-state admin-empty" style="color:#ff5252;">{{ error }}</p>
        <p v-else-if="Object.keys(resumen).length === 0" class="empty-state admin-empty">
          Ningún pedido esta semana todavía.
        </p>

        <div v-for="(datos, nombre) in resumen" v-else :key="nombre" class="admin-usuario-card">
          <div class="admin-usuario-nombre">
            <span>🧙 {{ nombre }}</span>
            <span style="font-size:0.8rem; color:var(--texto-gris);">
              {{ datos.cartas.length }} carta{{ datos.cartas.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <div v-if="datos.grupo !== 'Individual'" class="admin-usuario-cartas">Grupo: {{ datos.grupo }}</div>
          <div class="admin-pills">
            <span v-for="(c, i) in datos.cartas" :key="i" class="admin-pill">{{ c.nombre }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
