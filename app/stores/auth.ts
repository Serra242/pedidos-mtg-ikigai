import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    uid: '' as string,
    nombre: '' as string,
    email: '' as string,
    esAdmin: false,
    listo: false, // true cuando Firebase ya resolvió el estado inicial de auth
    limiteSemanal: 25,
    consumoSemanal: 0
  }),

  getters: {
    autenticado: (state) => !!state.uid,
    restantes: (state) => Math.max(0, state.limiteSemanal - state.consumoSemanal)
  },

  actions: {
    // Se llama una vez desde app.vue para escuchar los cambios de sesión
    async iniciarListener() {
      const { $auth } = useNuxtApp()
      const { apiFetch } = useApi()

      onAuthStateChanged($auth, async (user: User | null) => {
        if (user) {
          this.uid = user.uid
          this.email = user.email || ''
          this.nombre = user.displayName || (user.email ? user.email.split('@')[0] || 'Mago' : 'Mago')

          try {
            // Registra al usuario en el directorio y averigua si es admin (lo decide el servidor)
            const sesion = await apiFetch<{ ok: boolean; esAdmin: boolean; nombre: string }>('/api/session', { method: 'POST' })
            this.esAdmin = sesion.esAdmin
            if (sesion.nombre) this.nombre = sesion.nombre

            await this.cargarLimite()
          } catch (err) {
            const { mostrarToast } = useToast()
            const detalle = (err as { data?: { statusMessage?: string }, message?: string })
            mostrarToast(`Error conectando con el servidor: ${detalle?.data?.statusMessage || detalle?.message || 'desconocido'}`)
            console.error('Error al iniciar sesión con el servidor:', err)
          }
        } else {
          this.$reset()
        }
        this.listo = true
      })
    },

    async cargarLimite() {
      const { apiFetch } = useApi()
      const [config, limite] = await Promise.all([
        apiFetch<{ limiteSemanal: number }>('/api/config'),
        apiFetch<{ consumo: number }>('/api/limite')
      ])
      this.limiteSemanal = config.limiteSemanal
      this.consumoSemanal = limite.consumo
    },

    async login(email: string, password: string) {
      const { $auth } = useNuxtApp()
      await signInWithEmailAndPassword($auth, email, password)
    },

    async registrar(nombre: string, email: string, password: string) {
      const { $auth } = useNuxtApp()
      const cred = await createUserWithEmailAndPassword($auth, email, password)
      await updateProfile(cred.user, { displayName: nombre })
    },

    async logout() {
      const { $auth } = useNuxtApp()
      await signOut($auth)
    }
  }
})