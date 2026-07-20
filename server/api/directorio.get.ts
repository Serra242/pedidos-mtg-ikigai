import { adminDb } from '../utils/firebaseAdmin'
import { requireUser } from '../utils/auth'
import type { MagoDirectorio } from '../../shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  const snap = await adminDb().collection('directorio_magos').get()
  const magos: MagoDirectorio[] = []

  snap.forEach((doc) => {
    if (doc.id !== user.uid) {
      magos.push({ uid: doc.id, nombre: doc.data().nombre })
    }
  })

  return { magos }
})
