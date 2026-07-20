import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAuth, type Auth } from 'firebase-admin/auth'

let app: App
let _db: Firestore
let _auth: Auth

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!

  const config = useRuntimeConfig()

  app = initializeApp({
    credential: cert({
      projectId: config.firebaseAdminProjectId,
      clientEmail: config.firebaseAdminClientEmail,
      // Las variables de entorno suelen traer los saltos de línea escapados como \n literales
      privateKey: config.firebaseAdminPrivateKey.replace(/\\n/g, '\n')
    })
  })

  return app
}

export function adminDb(): Firestore {
  if (!_db) _db = getFirestore(getAdminApp())
  return _db
}

export function adminAuth(): Auth {
  if (!_auth) _auth = getAuth(getAdminApp())
  return _auth
}
