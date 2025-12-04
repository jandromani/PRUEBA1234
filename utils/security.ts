export type SuspiciousEvent = {
  category: 'signature' | 'auth' | 'sequence' | 'cors'
  detail: string
  endpoint?: string
  meta?: Record<string, unknown>
}

const encoder = new TextEncoder()

const getCrypto = () => {
  if (typeof crypto !== 'undefined' && crypto.subtle) return crypto.subtle
  throw new Error('Web Crypto API not available')
}

const normalizePayload = (payload: unknown) => {
  if (typeof payload === 'string') return payload
  try {
    return JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort())
  } catch {
    return JSON.stringify(payload)
  }
}

const bufferToBase64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))

export const signPayload = async (
  payload: unknown,
  secret: string,
  length = 32,
): Promise<string> => {
  const normalized = normalizePayload(payload)
  const subtle = getCrypto()
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await subtle.sign('HMAC', key, encoder.encode(normalized))
  return bufferToBase64(signature).replace(/[^a-zA-Z0-9]/g, '').slice(0, length)
}

export const verifySignature = async (
  payload: unknown,
  signature: string,
  secret: string,
): Promise<boolean> => {
  try {
    const expected = await signPayload(payload, secret, signature.length)
    return expected === signature
  } catch (error) {
    console.warn('Signature verification failed', error)
    return false
  }
}

export const reportSuspiciousEvent = (event: SuspiciousEvent) => {
  console.warn('[security:event]', event)

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      navigator.sendBeacon(
        '/api/security/log',
        JSON.stringify({ ...event, timestamp: new Date().toISOString() }),
      )
    } catch {
      // ignore beacon failures
    }
  }
}

export const getNextQuestionIndex = (key = 'global') => {
  if (typeof window === 'undefined') return 1

  const storageKey = `question_idx:${key}`
  const current = Number(sessionStorage.getItem(storageKey) || '0') + 1
  sessionStorage.setItem(storageKey, String(current))
  return current
}

export const isReplayAttempt = (fingerprint: string) => {
  if (typeof window === 'undefined') return false

  const storageKey = 'recent_request_fingerprints'
  const raw = sessionStorage.getItem(storageKey)
  const fingerprints = raw ? new Set<string>(JSON.parse(raw)) : new Set<string>()

  const isReplay = fingerprints.has(fingerprint)
  fingerprints.add(fingerprint)

  // keep the set bounded
  const trimmed = Array.from(fingerprints).slice(-50)
  sessionStorage.setItem(storageKey, JSON.stringify(trimmed))

  return isReplay
}

export type TextRenderOptions = {
  width?: number
  fontSize?: number
  fontFamily?: string
  padding?: number
}

export const renderTextToDataUrl = (
  text: string,
  options: TextRenderOptions = {},
): string | null => {
  if (typeof document === 'undefined') return null

  const width = options.width ?? 640
  const padding = options.padding ?? 12
  const fontSize = options.fontSize ?? 16
  const fontFamily = options.fontFamily ?? 'Inter, system-ui, -apple-system, sans-serif'

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  ctx.font = `${fontSize}px ${fontFamily}`

  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach(word => {
    const testLine = `${currentLine}${word} `
    const { width: testWidth } = ctx.measureText(testLine)
    if (testWidth > width - padding * 2) {
      lines.push(currentLine.trim())
      currentLine = `${word} `
    } else {
      currentLine = testLine
    }
  })

  lines.push(currentLine.trim())

  const lineHeight = fontSize * 1.4
  const height = Math.max(fontSize + padding * 2, lines.length * lineHeight + padding * 2)

  canvas.width = width
  canvas.height = height

  // background noise to deter OCR
  ctx.fillStyle = '#f7f7f8'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#d9dce0'
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = '#111827'
  ctx.textBaseline = 'top'

  lines.forEach((line, index) => {
    ctx.fillText(line, padding, padding + index * lineHeight)
  })

  return canvas.toDataURL('image/png')
}
