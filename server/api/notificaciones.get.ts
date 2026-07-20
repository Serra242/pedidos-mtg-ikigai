import { adminDb } from '../utils/firebaseAdmin'
import { requireUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = adminDb()

  const snap = await db
    .collection('notificaciones')
    .doc(user.uid)
    .collection('items')
    .where('leida', '==', false)
    .orderBy('fecha', 'desc')
    .limit(5)
    .get()

  if (snap.empty) return { mensajes: [] }

  const mensajes: string[] = []
  const batch = db.batch()

  snap.forEach((doc) => {
    mensajes.push(doc.data().de)
    batch.update(doc.ref, { leida: true })
  })

  await batch.commit()

  return { mensajes }
})
