import { adminDb } from '../utils/firebaseAdmin'
import { requireUser } from '../utils/auth'

// Se llama justo después de iniciar sesión en el cliente.
// Sustituye al "db.collection('directorio_magos').doc(uid).set(...)" que
// antes hacía el propio navegador directamente contra Firestore.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)

  await adminDb().collection('directorio_magos').doc(user.uid).set(
    { nombre: user.nombre, email: user.email },
    { merge: true }
  )

  return { ok: true, esAdmin: user.esAdmin, nombre: user.nombre }
})
