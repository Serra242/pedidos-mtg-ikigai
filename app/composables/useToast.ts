const mensaje = ref('')
const color = ref('var(--naranja-el99)')
const visible = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function mostrarToast(msj: string, colorToast?: string) {
    mensaje.value = msj
    color.value = colorToast || 'var(--naranja-el99)'
    visible.value = true

    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => { visible.value = false }, 3500)
  }

  return { mensaje, color, visible, mostrarToast }
}
