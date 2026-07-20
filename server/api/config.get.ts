import { adminDb } from '../utils/firebaseAdmin'
import { requireUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  await requireUser(event)

  const doc = await adminDb().collection('config').doc('global').get()
  const limite = doc.exists && doc.data()?.limite_semanal ? doc.data()!.limite_semanal : 25

  return { limiteSemanal: limite as number }
})
