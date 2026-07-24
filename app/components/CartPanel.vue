<script setup lang="ts">
import type { MagoDirectorio } from '../../shared/types'

const auth = useAuthStore()
const cestaStore = useCestaStore()
const { apiFetch } = useApi()
const { mostrarToast } = useToast()

const magos = ref<MagoDirectorio[]>([])
const seleccionados = ref<string[]>([])
const enviando = ref(false)
const cargandoDirectorio = ref(true)

const totalSemana = computed(() => auth.consumoSemanal + cestaStore.items.length)
const pct = computed(() => totalSemana.value / auth.limiteSemanal)

const colorContador = computed(() => {
  if (pct.value >= 1) return 'var(--rojo-eliminar)'
  if (pct.value >= 0.8) return 'var(--amarillo-warn)'
  return 'var(--naranja-el99)'
})

const claseBadge = computed(() => {
  if (pct.value >= 1) return 'danger'
  if (pct.value >= 0.8) return 'warn'
  return ''
})

async function cargarComunidad() {
  cargandoDirectorio.value = true
  try {
    const res = await apiFetch<{ magos: MagoDirectorio[] }>('/api/directorio')
    magos.value = res.magos
  } catch {
    magos.value = []
  } finally {
    cargandoDirectorio.value = false
  }
}

onMounted(cargarComunidad)

function eliminar(i: number) {
  cestaStore.eliminar(i, auth.nombre)
}

function vaciar() {
  if (cestaStore.items.length === 0) return
  if (!confirm(`¿Seguro? Se eliminarán ${cestaStore.items.length} carta${cestaStore.items.length !== 1 ? 's' : ''}.`)) return
  cestaStore.vaciar(auth.nombre)
  mostrarToast('Cesta vaciada.')
}

async function enviarPedido() {
  if (cestaStore.items.length === 0) return mostrarToast('No hay cartas en tu cesta.')

  enviando.value = true
  try {
    const res = await apiFetch<{ ok: boolean; consumoActualizado: number }>('/api/pedidos', {
      method: 'POST',
      body: { cesta: cestaStore.items, companeros: seleccionados.value }
    })

    auth.consumoSemanal = res.consumoActualizado
    mostrarToast('¡Pedido enviado con éxito! ✔', 'var(--verde-ok)')
    cestaStore.limpiarTrasEnvio(auth.nombre)
    seleccionados.value = []
  } catch (err: unknown) {
    const mensaje = (err as { data?: { statusMessage?: string } })?.data?.statusMessage
    mostrarToast(mensaje || 'Error de conexión al enviar el pedido.')
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <section id="panel-cesta" class="panel fade-in panel-cesta">
    <div class="panel-cesta-header">
      <h2>Tu Pedido ({{ cestaStore.items.length }})</h2>
      <div class="limite-badge tooltip" :class="claseBadge">
        Semanal: <strong :style="{ color: colorContador }">{{ totalSemana }}</strong> / {{ auth.limiteSemanal }}
        <span class="tooltiptext">Límite máximo de cartas por semana. Se resetea cada lunes.</span>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Carta</th>
            <th>Edición</th>
            <th class="text-center">Borrar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cestaStore.items.length === 0">
            <td colspan="3" class="text-center">
              <div class="empty-state" style="padding:24px 0;">
                <span style="font-size:2rem;">🗃️</span><br><br>
                Tu cesta está vacía.
              </div>
            </td>
          </tr>
          <tr v-for="(item, i) in cestaStore.items" :key="i" class="fade-in">
            <td data-label="Carta" style="color:var(--texto-claro);">{{ item.nombre }}</td>
            <td data-label="Edición" style="color:var(--texto-gris); font-size:0.82rem;">{{ item.set }} [{{ item.setCode.toUpperCase() }}]</td>
            <td data-label="" class="text-center">
              <button type="button" class="btn-eliminar-fila" @click="eliminar(i)">✕ Quitar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cart-footer">
      <div class="footer-acciones">
        <button type="button" class="btn-vaciar" :disabled="cestaStore.items.length === 0" @click="vaciar">
          🗑️ Vaciar cesta
        </button>
      </div>

      <div class="grupo-section">
        <label class="grupo-label">👥 ¿Te unes a alguien? <span class="opcional-tag">Opcional</span></label>
        <p class="grupo-desc">Selecciona magos para agrupar vuestras cartas en un mismo paquete y ahorrar en envíos.</p>
        <div class="lista-comunidad">
          <p v-if="cargandoDirectorio" class="empty-state" style="font-size:0.85rem; margin:0;">Invocando magos de El99...</p>
          <p v-else-if="magos.length === 0" class="empty-state" style="margin:0; font-size:0.85rem;">Eres el único mago registrado.</p>
          <label v-for="mago in magos" :key="mago.uid" class="checkbox-item">
            <input v-model="seleccionados" type="checkbox" class="checkbox-grupo" :value="mago.nombre">
            <span class="checkbox-custom" />
            {{ mago.nombre }}
          </label>
        </div>
      </div>

      <button
        id="btnEnviar"
        class="btn-confirmar"
        :disabled="cestaStore.items.length === 0 || enviando"
        @click="enviarPedido"
      >
        {{ enviando ? 'Enviando... ⏳' : 'Enviar Pedido Oficial 📤' }}
      </button>
    </div>
  </section>
</template>
