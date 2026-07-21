// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  imports: { dirs: ['stores'] },

  runtimeConfig: {
    // --- Solo disponibles en el servidor ---
    firebaseAdminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID || '',
    firebaseAdminClientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
    firebaseAdminPrivateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY || '',
    adminUid: process.env.ADMIN_UID || '',
    googleScriptUrl: process.env.GOOGLE_SCRIPT_URL || '',

    // --- Expuestas al cliente (prefijo "public") --
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || ''
    }
  },

  app: {
    head: {
      title: 'El99 - Nexo de Pedidos',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ]
    }
  }
})
