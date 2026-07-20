import { adminDb } from '../utils/firebaseAdmin'
import { requireUser, obtenerLunesActual } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const doc = await adminDb().collection('limites_semanales').doc(user.uid).get()
  const data = doc.data()

  const consumo = doc.exists && data?.semana === obtenerLunesActual() ? data.cantidad : 0

  return { consumo: consumo as number }
})
