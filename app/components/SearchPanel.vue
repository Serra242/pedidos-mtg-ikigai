<script setup lang="ts">
const busqueda = useBusquedaStore()
const query = ref('')

onMounted(() => busqueda.cargarHistorial())

function buscar() {
  if (!query.value.trim()) return
  busqueda.buscar(query.value)
}

function buscarDesdeHistorial(item: string) {
  query.value = item
  busqueda.buscar(item)
}
</script>

<template>
  <section id="panel-buscador" class="panel fade-in panel-buscador">
    <div class="panel-header">
      <h2>Catálogo de Cartas</h2>
    </div>

    <div class="search-bar">
      <input
        v-model="query"
        type="text"
        placeholder="Buscar carta (Enter o botón)..."
        @keypress.enter="buscar"
      >
      <button type="button" class="btn-primary btn-search" @click="buscar">Buscar</button>
    </div>

    <div id="resultadoBusqueda" class="card-preview">
      <p v-if="busqueda.cargando" class="empty-state">Buscando en todos los planos... 🌀</p>

      <p v-else-if="busqueda.error" class="empty-state" style="color:var(--rosa-palo)">
        {{ busqueda.error }}
      </p>

      <CardCarousel v-else-if="busqueda.resultados.length > 0" />

      <div v-else-if="busqueda.historial.length > 0" class="empty-state">
        <span style="font-size:2rem;">🔮</span><br><br>
        Búsquedas recientes:
        <div class="history-pills">
          <button
            v-for="item in busqueda.historial"
            :key="item"
            class="history-pill"
            @click="buscarDesdeHistorial(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <span style="font-size:2.5rem;">🎴</span><br><br>
        Escribe el nombre de una carta para empezar.
      </div>
    </div>
  </section>
</template>
