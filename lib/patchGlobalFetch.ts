import {
  getNextQuestionIndex,
  isReplayAttempt,
  reportSuspiciousEvent,
  signPayload,
  verifySignature,
} from '@/utils/security'

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/verifyWorldId', '/api/verify']
const INTERNAL_ENDPOINT_PATTERNS = [/^\/scheduler/, /^\/payouts/, /^\/internal/]

export const patchGlobalFetch = () => {
  if (typeof window === 'undefined') return

  const originalFetch = window.fetch
  const signatureSecret =
    process.env.NEXT_PUBLIC_SIGNATURE_SECRET ?? 'worldview-signature-salt'
  const serviceAuthToken = process.env.NEXT_PUBLIC_SERVICE_AUTH_TOKEN ?? ''

  window.fetch = async (input, init = {}) => {
    const token = localStorage.getItem('authToken')

    if (!input) {
      return originalFetch(input, init) // case of a server action
    }

    const isStringInput = typeof input === 'string'
    const endpoint = isStringInput ? input : ''

    const isInternal = isStringInput && endpoint.startsWith('/api')
    const isFullUrl = isStringInput && endpoint.startsWith('http')
    const isServiceEndpoint =
      isStringInput &&
      INTERNAL_ENDPOINT_PATTERNS.some(pattern => pattern.test(endpoint))
    const requiresAuth =
      !isFullUrl &&
      !isInternal &&
      !PUBLIC_ENDPOINTS.some(path => endpoint.startsWith(path))

    if (requiresAuth && !token) {
      reportSuspiciousEvent({
        category: 'auth',
        detail: 'Missing JWT on protected request',
        endpoint,
      })
      throw new Error('Authentication token required for this action')
    }

    if (isServiceEndpoint && !serviceAuthToken) {
      reportSuspiciousEvent({
        category: 'auth',
        detail: 'Service auth token missing for internal endpoint',
        endpoint,
      })
      throw new Error('Internal endpoint blocked: missing service auth token')
    }

    const url =
      isInternal || isFullUrl
        ? input
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}${input}`

    const method = (init.method || 'GET').toUpperCase()
    const questionIdx =
      isStringInput && endpoint.startsWith('/poll')
        ? getNextQuestionIndex(endpoint)
        : undefined

    const normalizedHeaders =
      init.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : ((init.headers as Record<string, string>) || {})

    const headers: Record<string, string> = {
      ...normalizedHeaders,
      ...(token && !isFullUrl && !isInternal
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(isServiceEndpoint ? { 'X-Service-Auth': serviceAuthToken } : {}),
      ...(questionIdx ? { 'X-Question-Idx': String(questionIdx) } : {}),
      'Content-Type': 'application/json',
      'X-Request-Time': new Date().toISOString(),
    }

    const requestSignature = await signPayload(
      {
        url,
        method,
        body: init.body ?? null,
        questionIdx,
      },
      signatureSecret,
      28,
    )

    if (method !== 'GET' && isReplayAttempt(requestSignature)) {
      reportSuspiciousEvent({
        category: 'sequence',
        detail: 'Replay attempt detected for request',
        endpoint,
        meta: { method },
      })
      throw new Error('Request rejected due to replay protection')
    }

    headers['X-Request-Signature'] = requestSignature

    const response = await originalFetch(url, {
      ...init,
      headers,
      credentials: 'include',
      mode: 'cors',
    })

    if (
      !isFullUrl &&
      !isInternal &&
      input !== '/auth/verifyWorldId' &&
      response.status === 401
    ) {
      reportSuspiciousEvent({
        category: 'auth',
        detail: 'Unauthorized request detected (401)',
        endpoint,
      })
      localStorage.removeItem('authToken')

      window.location.href = '/login'
    }

    const responseClone = response.clone()
    const responseSignature = responseClone.headers.get('x-response-signature')

    if (responseSignature) {
      const body = await responseClone.clone().text()
      const isValid = await verifySignature(body, responseSignature, signatureSecret)

      if (!isValid) {
        reportSuspiciousEvent({
          category: 'signature',
          detail: 'Response signature verification failed',
          endpoint,
        })
        throw new Error('Possible response tampering detected')
      }
    }

    if (isServiceEndpoint) {
      const allowOrigin = responseClone.headers.get('access-control-allow-origin')
      if (allowOrigin && allowOrigin !== window.location.origin) {
        reportSuspiciousEvent({
          category: 'cors',
          detail: 'Strict CORS violation on internal endpoint',
          endpoint,
          meta: { allowOrigin },
        })
      }
    }

    return responseClone
  }
}
