<script setup lang="ts">
const auth = useAuthStore()
const { mostrarToast } = useToast()

const modo = ref<'login' | 'registro'>('login')

const loginEmail = ref('')
const loginPass = ref('')

const regNombre = ref('')
const regEmail = ref('')
const regPass = ref('')

const cargando = ref(false)

async function onLogin() {
  cargando.value = true
  try {
    await auth.login(loginEmail.value, loginPass.value)
  } catch {
    mostrarToast('Error: Usuario o contraseña incorrectos.')
  } finally {
    cargando.value = false
  }
}

async function onRegistro() {
  cargando.value = true
  try {
    await auth.registrar(regNombre.value, regEmail.value, regPass.value)
    mostrarToast('¡Cuenta creada! Bienvenido a El99.')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    mostrarToast(`Error: ${msg}`)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div id="auth-container" class="view-section active">
    <div class="auth-wrapper slide-up">
      <div class="auth-header">
        <h1>El99</h1>
        <p>Comunidad MTG Hub</p>
      </div>

      <div v-if="modo === 'login'" class="auth-box">
        <h2>Iniciar Sesión</h2>
        <form @submit.prevent="onLogin">
          <div class="input-group">
            <label>Usuario (Email)</label>
            <input v-model="loginEmail" type="email" required placeholder="ejemplo@correo.com">
          </div>
          <div class="input-group">
            <label>Contraseña</label>
            <input v-model="loginPass" type="password" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn-primary" :disabled="cargando">Entrar al Nexo</button>
        </form>
        <p class="auth-switch">
          ¿Nuevo?
          <button type="button" class="btn-link" @click="modo = 'registro'">Crea tu perfil</button>
        </p>
      </div>

      <div v-else class="auth-box">
        <h2>Nuevo Registro</h2>
        <form @submit.prevent="onRegistro">
          <div class="input-group">
            <label>Nombre de Mago</label>
            <input v-model="regNombre" type="text" required placeholder="Ej: Jace Beleren">
          </div>
          <div class="input-group">
            <label>Email</label>
            <input v-model="regEmail" type="email" required placeholder="tu@email.com">
          </div>
          <div class="input-group">
            <label>Contraseña</label>
            <input v-model="regPass" type="password" required minlength="6" placeholder="Mínimo 6 caracteres">
          </div>
          <button type="submit" class="btn-secondary" :disabled="cargando">Crear Perfil</button>
        </form>
        <p class="auth-switch">
          <button type="button" class="btn-link" @click="modo = 'login'">Volver atrás</button>
        </p>
      </div>
    </div>
  </div>
</template>
