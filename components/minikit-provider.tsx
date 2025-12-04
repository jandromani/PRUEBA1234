'use client' // Required for Next.js

import { MiniKit } from '@worldcoin/minikit-js'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const allowWebPreview =
    process.env.NEXT_PUBLIC_ALLOW_WEB_PREVIEW?.toLowerCase() === 'true'

  useEffect(() => {
    MiniKit.install()

    if (!MiniKit.isInstalled() && !allowWebPreview) {
      setShouldRedirect(true)
      router.push('/error')
    }
  }, [])

  return (
    <>
      {!MiniKit.isInstalled() && allowWebPreview && (
        <div className="bg-amber-100 text-amber-900 text-sm px-4 py-3 text-center">
          Preview mode: funciones sensibles requieren World App.
        </div>
      )}
      {!shouldRedirect && children}
    </>
  )
}
