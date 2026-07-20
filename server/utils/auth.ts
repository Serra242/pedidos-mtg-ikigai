import type { H3Event } from 'h3'
import { adminAuth } from './firebaseAdmin'

export interface UsuarioAutenticado {
  uid: string
  email: string
  nombre: string
  esAdmin: boolean
}

/**
 * Lee el header "Authorization: Bearer <idToken>", lo verifica contra
 * Firebase Admin y devuelve el usuario. Lanza 401 si no es válido.
 * Esta es LA pieza clave que hace que el backend sea "de verdad":
 * el cliente ya no puede mentir sobre quién es.
 */
export async function requireUser(event: H3Event): Promise<UsuarioAutenticado> {
  const header = getHeader(event, 'authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Falta el token de autenticación.' })
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token)
    const config = useRuntimeConfig()

    return {
      uid: decoded.uid,
      email: decoded.email || '',
      nombre: decoded.name || (decoded.email ? decoded.email.split('@')[0] || 'Mago' : 'Mago'),
      esAdmin: decoded.uid === config.adminUid
    }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Token inválido o caducado.' })
  }
}

export async function requireAdmin(event: H3Event): Promise<UsuarioAutenticado> {
  const user = await requireUser(event)
  if (!user.esAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'No tienes permisos de administrador.' })
  }
  return user
}

export function obtenerLunesActual(): number {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.getFullYear(), d.getMonth(), diff).getTime()
}
