import { defineStore } from 'pinia'
import type { CestaItem } from '../../shared/types'

export const useCestaStore = defineStore('cesta', {
  state: () => ({
    items: [] as CestaItem[]
  }),

  actions: {
    _clavePersistencia(nombreUsuario: string) {
      return `cesta_${nombreUsuario}`
    },

    cargarDesdeStorage(nombreUsuario: string) {
      if (import.meta.server) return
      const guardado = localStorage.getItem(this._clavePersistencia(nombreUsuario))
      this.items = guardado ? JSON.parse(guardado) : []
    },

    _persistir(nombreUsuario: string) {
      if (import.meta.server) return
      localStorage.setItem(this._clavePersistencia(nombreUsuario), JSON.stringify(this.items))
    },

    anadir(item: CestaItem, cantidad: number, nombreUsuario: string) {
      for (let i = 0; i < cantidad; i++) this.items.push(item)
      this._persistir(nombreUsuario)
    },

    eliminar(indice: number, nombreUsuario: string) {
      this.items.splice(indice, 1)
      this._persistir(nombreUsuario)
    },

    vaciar(nombreUsuario: string) {
      this.items = []
      localStorage.removeItem(this._clavePersistencia(nombreUsuario))
    },

    limpiarTrasEnvio(nombreUsuario: string) {
      this.items = []
      localStorage.removeItem(this._clavePersistencia(nombreUsuario))
    },

    contarEnCesta(nombre: string, setCode: string): number {
      return this.items.filter((c) => c.nombre === nombre && c.setCode === setCode).length
    }
  }
})
