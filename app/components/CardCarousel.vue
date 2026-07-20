<script setup lang="ts">
const busqueda = useBusquedaStore()
const cestaStore = useCestaStore()
const auth = useAuthStore()
const { mostrarToast } = useToast()

const cantidad = ref(1)

const restantes = computed(() => auth.limiteSemanal - auth.consumoSemanal - cestaStore.items.length)
const limiteAlcanzado = computed(() => restantes.value <= 0)
const maxCantidad = computed(() => Math.min(Math.max(restantes.value, 1), 4))

watch(() => busqueda.indiceActual, () => {
  cantidad.value = 1
})

const yaEnCesta = computed(() => {
  const carta = busqueda.cartaActual
  if (!carta) return 0
  return cestaStore.contarEnCesta(carta.name, carta.set)
})

function anadir() {
  const carta = busqueda.cartaActual
  if (!carta) return

  const pedido = Math.max(1, cantidad.value || 1)
  if (pedido > restantes.value) {
    mostrarToast(`Solo puedes añadir ${restantes.value} carta${restantes.value !== 1 ? 's' : ''} más esta semana.`)
    return
  }

  cestaStore.anadir({ nombre: carta.name, set: carta.set_name, setCode: carta.set }, pedido, auth.nombre)
  mostrarToast(`${pedido} ${pedido > 1 ? 'cartas añadidas' : 'carta añadida'} ✔`)
}
</script>

<template>
  <div v-if="busqueda.cartaActual" class="carousel-container fade-in">
    <button type="button" class="carousel-btn" @click="busqueda.cambiarVersion(-1)">❮</button>

    <div id="tarjeta-activa" class="carousel-content">
      <p style="font-size:0.8rem; color:var(--texto-gris); margin-bottom:5px;">
        Versión {{ busqueda.indiceActual + 1 }} de {{ busqueda.resultados.length }}
      </p>

      <div class="carousel-img-wrapper">
        <img :src="busqueda.imagenDe(busqueda.cartaActual)" alt="Carta">
        <span v-if="yaEnCesta > 0" class="badge-en-cesta">✔ {{ yaEnCesta }} en pedido</span>
      </div>

      <div>
        <h3 style="margin:0 0 4px 0; color:var(--texto-claro); font-size:1.05rem; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
          {{ busqueda.cartaActual.name }}
        </h3>
        <p style="font-size:0.82rem; color:var(--texto-gris); margin:0 0 12px 0;">
          {{ busqueda.cartaActual.set_name.toUpperCase() }} [{{ busqueda.cartaActual.lang.toUpperCase() }}]
        </p>
      </div>

      <div class="carousel-add-row">
        <input v-model.number="cantidad" type="number" class="qty-input" min="1" :max="maxCantidad" :disabled="limiteAlcanzado">
        <button
          type="button"
          class="btn-primary"
          style="width:auto;"
          :disabled="limiteAlcanzado"
          :style="limiteAlcanzado ? { background: '#444' } : {}"
          @click="anadir"
        >
          {{ limiteAlcanzado ? 'Límite alcanzado' : 'Añadir al Pedido' }}
        </button>
      </div>
    </div>

    <button type="button" class="carousel-btn" @click="busqueda.cambiarVersion(1)">❯</button>
  </div>
</template>
