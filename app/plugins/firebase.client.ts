import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Este plugin SOLO inicializa Firebase Auth en el navegador.
// Firestore ya no se toca desde el cliente: todo pasa por /server/api
// usando firebase-admin, que es quien de verdad tiene permisos.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const app = initializeApp({
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    appId: config.public.firebaseAppId
  })

  const auth = getAuth(app)

  return {
    provide: { auth }
  }
})
