import { adminDb } from '../utils/firebaseAdmin'
import { requireUser } from '../utils/auth'
import type { Pedido } from '../../shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const snap = await adminDb()
    .collection('pedidos')
    .where('uid', '==', user.uid)
    .orderBy('fecha', 'desc')
    .limit(10)
    .get()

  const pedidos: Pedido[] = snap.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      uid: d.uid,
      usuario: d.usuario,
      cesta: d.cesta || [],
      grupo: d.grupo,
      semana: d.semana,
      fecha: d.fecha?.toMillis ? d.fecha.toMillis() : null
    }
  })

  return { pedidos }
})
