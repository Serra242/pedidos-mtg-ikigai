export function useApi() {
  const { $auth } = useNuxtApp()

  async function authHeaders(): Promise<Record<string, string>> {
    const user = $auth.currentUser
    if (!user) return {}
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  async function apiFetch<T>(url: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers = await authHeaders()
    return $fetch(url, {
      ...opts,
      headers: { ...headers, ...(opts?.headers as Record<string, string> | undefined) }
    }) as Promise<T>
  }

  return { apiFetch }
}
