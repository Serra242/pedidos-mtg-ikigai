import { adminDb } from '../../utils/firebaseAdmin'
import { requireAdmin, obtenerLunesActual } from '../../utils/auth'
import type { CestaItem } from '../../../shared/types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const snap = await adminDb()
    .collection('pedidos')
    .where('semana', '==', obtenerLunesActual())
    .orderBy('fecha', 'desc')
    .get()

  const porUsuario: Record<string, { cartas: CestaItem[]; grupo: string }> = {}

  snap.forEach((doc) => {
    const d = doc.data()
    if (!porUsuario[d.usuario]) porUsuario[d.usuario] = { cartas: [], grupo: d.grupo }
    porUsuario[d.usuario]!.cartas.push(...(d.cesta || []))
  })

  return { porUsuario }
})
