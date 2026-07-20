export interface CestaItem {
  nombre: string
  set: string
  setCode: string
}

export interface Pedido {
  id?: string
  uid: string
  usuario: string
  cesta: CestaItem[]
  grupo: string
  semana: number
  fecha: number | null
}

export interface MagoDirectorio {
  uid: string
  nombre: string
}

export interface Notificacion {
  id: string
  de: string
  leida: boolean
  fecha: number | null
}

export interface ScryfallCard {
  name: string
  set: string
  set_name: string
  lang: string
  image_uris?: { normal: string }
  card_faces?: { image_uris?: { normal: string } }[]
}
