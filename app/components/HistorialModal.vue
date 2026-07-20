<script setup lang="ts">
import type { Pedido } from '../../shared/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ cerrar: [] }>()

const { apiFetch } = useApi()
const pedidos = ref<Pedido[]>([])
const cargando = ref(true)
const error = ref('')

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ pedidos: Pedido[] }>('/api/historial')
    pedidos.value = res.pedidos
  } catch {
    error.value = 'Error al cargar el historial.'
  } finally {
    cargando.value = false
  }
}

watch(() => props.visible, (v) => { if (v) cargar() })

function formatearFecha(ts: number | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="emit('cerrar')">
    <div class="modal-box slide-up">
      <div class="modal-header">
        <h3>📜 Mis Pedidos Anteriores</h3>
        <button type="button" class="modal-close" @click="emit('cerrar')">✕</button>
      </div>

      <div>
        <p v-if="cargando" class="empty-state" style="padding:20px;">Cargando...</p>
        <p v-else-if="error" class="empty-state" style="color:#ff5252; padding:20px;">{{ error }}</p>
        <p v-else-if="pedidos.length === 0" class="empty-state" style="padding:24px; text-align:center;">
          Aún no has enviado ningún pedido.
        </p>

        <div v-for="pedido in pedidos" v-else :key="pedido.id" class="historial-card">
          <div class="historial-card-header">
            <span class="historial-fecha">📅 {{ formatearFecha(pedido.fecha) }}</span>
            <span class="historial-grupo">{{ pedido.grupo !== 'Individual' ? '👥 ' + pedido.grupo : '🧙 Individual' }}</span>
          </div>
          <ul class="historial-cartas">
            <li v-for="(c, i) in pedido.cesta" :key="i">
              <span>{{ c.nombre }}</span>
              <span class="historial-set">{{ c.set }} [{{ (c.setCode || '').toUpperCase() }}]</span>
            </li>
          </ul>
          <p style="font-size:0.8rem; color:var(--texto-gris); margin:10px 0 0 0; text-align:right;">
            {{ pedido.cesta.length }} carta{{ pedido.cesta.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
