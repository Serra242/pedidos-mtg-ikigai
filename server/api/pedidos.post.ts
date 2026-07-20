import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '../utils/firebaseAdmin'
import { requireUser, obtenerLunesActual } from '../utils/auth'
import type { CestaItem } from '../../shared/types'

interface BodyPedido {
  cesta: CestaItem[]
  companeros: string[]
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<BodyPedido>(event)

  const cesta = Array.isArray(body?.cesta) ? body.cesta : []
  const companeros = Array.isArray(body?.companeros) ? body.companeros : []

  if (cesta.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'La cesta está vacía.' })
  }

  const db = adminDb()
  const config = useRuntimeConfig()
  const semanaActual = obtenerLunesActual()

  // --- 1. Comprobar límite semanal EN EL SERVIDOR (aquí ya no se puede hacer trampa) ---
  const configDoc = await db.collection('config').doc('global').get()
  const limiteSemanal = configDoc.exists && configDoc.data()?.limite_semanal
    ? configDoc.data()!.limite_semanal
    : 25

  const limiteDoc = await db.collection('limites_semanales').doc(user.uid).get()
  const limiteData = limiteDoc.data()
  const consumoActual = limiteDoc.exists && limiteData?.semana === semanaActual ? limiteData.cantidad : 0

  if (consumoActual + cesta.length > limiteSemanal) {
    throw createError({
      statusCode: 400,
      statusMessage: `Superarías el límite semanal (${consumoActual}/${limiteSemanal}). Solo puedes añadir ${Math.max(0, limiteSemanal - consumoActual)} carta(s) más.`
    })
  }

  const grupoFinal = companeros.length > 0 ? companeros.join(', ') : 'Individual'

  // --- 2. Actualizar consumo semanal ---
  await db.collection('limites_semanales').doc(user.uid).set({
    semana: semanaActual,
    cantidad: consumoActual + cesta.length
  })

  // --- 3. Guardar el pedido ---
  const pedidoRef = await db.collection('pedidos').add({
    uid: user.uid,
    usuario: user.nombre,
    cesta,
    grupo: grupoFinal,
    semana: semanaActual,
    fecha: FieldValue.serverTimestamp()
  })

  // --- 4. Notificar a los compañeros de grupo ---
  if (companeros.length > 0) {
    const directorioSnap = await db.collection('directorio_magos').get()
    const mapaUid: Record<string, string> = {}
    directorioSnap.forEach((doc) => { mapaUid[doc.data().nombre] = doc.id })

    const batch = db.batch()
    companeros.forEach((nombre) => {
      const uidCompanero = mapaUid[nombre]
      if (!uidCompanero) return
      const ref = db.collection('notificaciones').doc(uidCompanero).collection('items').doc()
      batch.set(ref, { de: user.nombre, leida: false, fecha: FieldValue.serverTimestamp() })
    })
    await batch.commit()
  }

  // --- 5. Exportar a Google Sheets (la URL ya no está expuesta al navegador) ---
  if (config.googleScriptUrl) {
    try {
      await $fetch(config.googleScriptUrl, {
        method: 'POST',
        body: { usuario: user.nombre, cesta, grupo: grupoFinal }
      })
    } catch {
      // No bloqueamos el pedido si falla la exportación a Excel
    }
  }

  return { ok: true, id: pedidoRef.id, consumoActualizado: consumoActual + cesta.length, limiteSemanal }
})
