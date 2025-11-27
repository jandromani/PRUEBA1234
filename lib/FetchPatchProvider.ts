'use client'

import { useEffect } from 'react'
import { patchGlobalFetch } from '@/lib/patchGlobalFetch'

export const FetchPatchProvider = () => {
  useEffect(() => {
    patchGlobalFetch()
  }, [])

  return null
}
