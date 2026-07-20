import { adminDb } from '../utils/firebaseAdmin'
import { requireAdmin } from '../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ limiteSemanal: number }>(event)
  const nuevoLimite = Number(body?.limiteSemanal)

  if (!nuevoLimite || nuevoLimite < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Límite inválido.' })
  }

  await adminDb().collection('config').doc('global').set(
    { limite_semanal: nuevoLimite },
    { merge: true }
  )

  return { ok: true, limiteSemanal: nuevoLimite }
})
