'use client'

import { useState } from 'react'

export const useShare = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  const handleShareTournament = async (tournamentTitle: string, tournamentId: number) => {
    const url = `${appUrl}/tournaments/${tournamentId}`
    await navigator.clipboard.writeText(url)
    setShareUrl(url)
    setIsOpen(true)
  }

  const handleShareResults = async (tournamentTitle: string, tournamentId: number) => {
    const url = `${appUrl}/tournaments/${tournamentId}`
    await navigator.clipboard.writeText(url)
    setShareUrl(url)
    setIsOpen(true)
  }

  return { isOpen, setIsOpen, handleShareTournament, handleShareResults, shareUrl }
}
