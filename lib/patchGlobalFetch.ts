export const patchGlobalFetch = () => {
  if (typeof window === 'undefined') return

  const originalFetch = window.fetch

  window.fetch = async (input, init = {}) => {
    const token = localStorage.getItem('authToken')

    if (!input) {
      return originalFetch(input, init) // case of a server action
    }

    const isInternal = typeof input === 'string' && input.startsWith('/api')
    const isFullUrl = typeof input === 'string' && input.startsWith('http')
    const url =
      isInternal || isFullUrl
        ? input
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${input}`

    const headers = {
      ...(init.headers || {}),
      ...(token && !isFullUrl && !isInternal
        ? { Authorization: `Bearer ${token}` }
        : {}),
      'Content-Type': 'application/json',
    }

    const response = await originalFetch(url, { ...init, headers })

    if (
      !isFullUrl &&
      !isInternal &&
      input !== '/auth/verifyWorldId' &&
      response.status === 401
    ) {
      console.error('Unauthorized request detected (401)')
      localStorage.removeItem('authToken')

      window.location.href = '/login'
    }

    return response.clone()
  }
}
