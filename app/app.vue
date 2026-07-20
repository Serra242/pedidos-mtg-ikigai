<script setup lang="ts">
const auth = useAuthStore()

// Limpieza de la URL (equivalente al replaceState del script.js original)
onMounted(() => {
  if (window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname)
  }
  auth.iniciarListener()
})
</script>

<template>
  <div>
    <AppToast />

    <ClientOnly>
      <template v-if="auth.listo">
        <MainApp v-if="auth.autenticado" />
        <AuthView v-else />
      </template>
      <div v-else class="empty-state" style="padding-top: 40px; text-align:center;">
        Cargando El99...
      </div>
    </ClientOnly>
  </div>
</template>
