'use client'

import { useEffect, useMemo, useState } from 'react'
import { renderTextToDataUrl } from '@/utils/security'

type SecureTextCanvasProps = {
  text: string
  className?: string
  obfuscate?: boolean
  width?: number
  fontSize?: number
}

export function SecureTextCanvas({
  text,
  className,
  obfuscate = false,
  width,
  fontSize,
}: SecureTextCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  const trimmedText = useMemo(() => text.trim(), [text])

  useEffect(() => {
    const url = renderTextToDataUrl(trimmedText, { width, fontSize })
    setDataUrl(url)
  }, [trimmedText, width, fontSize])

  if (!trimmedText) return null

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={trimmedText}
        className={className}
        aria-label="secured-text"
      />
    )
  }

  return (
    <span
      className={`${className ?? ''} ${obfuscate ? 'blur-[2px] select-none' : ''}`}
      aria-label={obfuscate ? 'obfuscated-text' : undefined}
    >
      {trimmedText}
    </span>
  )
}
