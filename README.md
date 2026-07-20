# El99 — Nexo de Pedidos (Nuxt 3/4)

Migración de la web original (HTML + JS vanilla + Firebase client) a **Nuxt** con
**Vue 3 + Composition API + Pinia + TypeScript**.

## Qué cambia respecto a la versión original

La app funciona igual para el usuario, pero la arquitectura es distinta:

- **Firebase Auth** sigue gestionando login/registro (email + contraseña), tal cual.
- **Firestore ya NO se toca desde el navegador.** Antes cualquier persona podía abrir
  las devtools y escribir directamente en la base de datos (falsificar pedidos, saltarse
  el límite semanal, tocar la config global...). Ahora todo pasa por endpoints propios
  en `server/api/*`, que usan `firebase-admin` y validan cada petición contra el token
  de Firebase del usuario.
- El límite semanal, el panel de admin y la URL del Google Script para exportar a Excel
  ya no son visibles ni manipulables desde el cliente.

## Estructura

```
app/
  components/     Vue components (AuthView, MainApp, SearchPanel, CartPanel, modales...)
  stores/          Pinia: auth.ts, cesta.ts, busqueda.ts
  composables/    useApi (fetch autenticado), useToast
  plugins/         firebase.client.ts (solo Auth)
  assets/css/      main.css (el mismo diseño original, sin cambios)
server/
  api/             Endpoints Nitro: config, limite, directorio, historial,
                   pedidos, notificaciones, admin/resumen, session
  utils/           firebaseAdmin.ts, auth.ts (verificación de token)
shared/
  types.ts         Tipos compartidos cliente/servidor
```

## Puesta en marcha

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y rellena tus credenciales:
   ```bash
   cp .env.example .env
   ```

   - `FIREBASE_*` (sin `ADMIN_`): los sacas de Firebase Console → Configuración del
     proyecto → General → tus apps → SDK config. Son públicas, van al navegador.
   - `FIREBASE_ADMIN_*`: Firebase Console → Configuración del proyecto → Cuentas de
     servicio → "Generar nueva clave privada". Descarga el JSON y copia
     `project_id`, `client_email` y `private_key` (con los `\n` tal cual, entre comillas).
     **Esto es secreto, nunca lo subas a un repo público ni lo pongas en variables `NUXT_PUBLIC_*`.**
   - `ADMIN_UID`: tu UID de usuario en Firebase Authentication.
   - `GOOGLE_SCRIPT_URL`: la URL de tu Apps Script para exportar a Excel (opcional,
     si la dejas vacía simplemente no se exporta).

3. Arranca en desarrollo:
   ```bash
   npm run dev
   ```

4. Build de producción:
   ```bash
   npm run build
   node .output/server/index.mjs
   ```

## Despliegue

El preset por defecto es `node-server`, así que funciona en cualquier hosting que
corra Node (Railway, Render, un VPS...). Si prefieres serverless (Vercel, Netlify,
Cloudflare), cambia el `nitro.preset` en `nuxt.config.ts` — Nuxt lo soporta sin tocar
el resto del código. Recuerda configurar las variables de entorno (sobre todo las
`FIREBASE_ADMIN_*`) como **secretas** en el panel de tu hosting.

## Reglas de seguridad de Firestore

Como ahora todo pasa por el servidor con `firebase-admin` (que tiene acceso total,
salta las reglas), puedes endurecer las reglas de Firestore para que **nadie** pueda
leer/escribir desde el cliente:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
