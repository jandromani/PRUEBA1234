'use client' // Required for Next.js

import { MiniKit } from '@worldcoin/minikit-js'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    MiniKit.install()

    if (!MiniKit.isInstalled()) {
      router.push('/error')
    }
  }, [])

  return <>{children}</>
}
