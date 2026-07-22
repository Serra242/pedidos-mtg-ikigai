<script setup lang="ts">
const auth = useAuthStore()
const cestaStore = useCestaStore()
const { apiFetch } = useApi()

const tabActiva = ref<'buscador' | 'cesta'>('buscador')
const mostrarBadgeTab = ref(false)
const modalHistorial = ref(false)
const modalAdmin = ref(false)
const bannerNotif = ref('')

watch(() => cestaStore.items.length, (nuevo, viejo) => {
  if (nuevo > viejo && tabActiva.value !== 'cesta') mostrarBadgeTab.value = true
})

function cambiarTab(tab: 'buscador' | 'cesta') {
  tabActiva.value = tab
  if (tab === 'cesta') mostrarBadgeTab.value = false
}

async function comprobarNotificaciones() {
  try {
    const res = await apiFetch<{ mensajes: string[] }>('/api/notificaciones')
    if (res.mensajes.length === 0) return
    bannerNotif.value = res.mensajes.map((de) => `<strong>${de}</strong> te ha incluido en su pedido esta semana 🧙`).join(' &nbsp;·&nbsp; ')
    setTimeout(() => { bannerNotif.value = '' }, 8000)
  } catch {
    // silencioso, igual que en la versión original
  }
}

onMounted(() => {
  cestaStore.cargarDesdeStorage(auth.nombre)
  comprobarNotificaciones()
})

async function cerrarSesion() {
  await auth.logout()
}
</script>

<template>
  <div id="app-container" class="view-section active">
    <header>
      <div class="header-content">
        <h1 class="logo">El99</h1>
        <div class="user-info">
          <button v-if="auth.esAdmin" class="btn-admin" @click="modalAdmin = true">⚙️ Admin</button>
          <button class="btn-historial" @click="modalHistorial = true">📜 Mis Pedidos</button>
          <span class="user-name-label">Mago: <strong class="accent-text">{{ auth.nombre }}</strong></span>
          <button class="btn-logout" @click="cerrarSesion">Salir</button>
        </div>
      </div>
    </header>

    <div v-if="bannerNotif" class="banner-notif" v-html="bannerNotif" />

    <main class="container">
      <div class="mobile-tabs fade-in">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: tabActiva === 'buscador' }"
          @click="cambiarTab('buscador')"
        >
          🔍 Buscar
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: tabActiva === 'cesta' }"
          @click="cambiarTab('cesta')"
        >
          🛒 Cesta ({{ cestaStore.items.length }})
          <span v-if="mostrarBadgeTab" class="tab-badge">!</span>
        </button>
      </div>

      <SearchPanel :class="{ 'mobile-hidden': tabActiva !== 'buscador' }" />
      <CartPanel :class="{ 'mobile-hidden': tabActiva !== 'cesta' }" />
    </main>
    <footer class="app-footer">
      Una iniciativa de
      <a href="https://ikigaicomicstienda.com" target="_blank" rel="noopener noreferrer">Ikigai Comics</a>
    </footer>
    <HistorialModal :visible="modalHistorial" @cerrar="modalHistorial = false" />
    <AdminModal :visible="modalAdmin" @cerrar="modalAdmin = false" />
  </div>
</template>
