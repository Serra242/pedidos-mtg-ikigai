import { defineStore } from 'pinia'
import type { ScryfallCard } from '../../shared/types'

export const useBusquedaStore = defineStore('busqueda', {
  state: () => ({
    resultados: [] as ScryfallCard[],
    indiceActual: 0,
    cargando: false,
    error: '',
    historial: [] as string[]
  }),

  getters: {
    cartaActual: (state) => state.resultados[state.indiceActual] || null
  },

  actions: {
    cargarHistorial() {
      if (import.meta.server) return
      this.historial = JSON.parse(localStorage.getItem('historial_el99') || '[]')
    },

    guardarEnHistorial(query: string) {
      const limpia = query.toLowerCase().trim()
      this.historial = this.historial.filter((b) => b.toLowerCase() !== limpia)
      this.historial.unshift(query.trim())
      if (this.historial.length > 8) this.historial.pop()
      if (!import.meta.server) {
        localStorage.setItem('historial_el99', JSON.stringify(this.historial))
      }
    },

    async buscar(query: string) {
      const q = query.trim()
      if (!q) return

      this.cargando = true
      this.error = ''

      try {
        const data = await $fetch<{ data?: ScryfallCard[]; status?: number }>(
          'https://api.scryfall.com/cards/search',
          { params: { q: `${q} unique:prints` } }
        )

        if (!data.data || data.data.length === 0) {
          this.resultados = []
          this.error = 'Carta no encontrada. Intenta ser más específico.'
          return
        }

        this.guardarEnHistorial(q)
        this.resultados = data.data.slice(0, 15)
        this.indiceActual = 0
      } catch {
        this.resultados = []
        this.error = 'Error de red al buscar.'
      } finally {
        this.cargando = false
      }
    },

    cambiarVersion(direccion: number) {
      if (this.resultados.length === 0) return
      this.indiceActual += direccion
      if (this.indiceActual >= this.resultados.length) this.indiceActual = 0
      if (this.indiceActual < 0) this.indiceActual = this.resultados.length - 1
    },

    imagenDe(carta: ScryfallCard): string {
      return carta.image_uris?.normal || carta.card_faces?.[0]?.image_uris?.normal || ''
    }
  }
})
