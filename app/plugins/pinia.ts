import { createPinia } from 'pinia'

// Sustituye al módulo "@pinia/nuxt", que en su versión actual (1.0.1)
// tiene un bug conocido al serializar el estado en el hook "app:rendered"
// durante el renderizado en servidor (ver: github.com/vuejs/pinia/discussions/3067).
//
// Este plugin es universal (server + client): cada petición SSR crea su
// propia instancia de Pinia (necesaria porque app.vue llama a useAuthStore()
// al arrancar), pero NUNCA serializamos ese estado al payload, porque todo
// el contenido real que usa las stores vive dentro de <ClientOnly> y se
// hidrata desde cero en el navegador. Así evitamos el bug sin perder nada.
export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
})