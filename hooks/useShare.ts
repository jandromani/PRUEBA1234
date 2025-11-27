import { useState } from 'react'

const appUrl = `https://world.org/mini-app?app_id=${process.env.NEXT_PUBLIC_APP_ID}&path=`

export const useShare = () => {
  // for custom share modal
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const handleSharePoll = async (pollTitle: string, pollId: number) => {
    const shareUrl = `${appUrl}/poll/${pollId}`
    await handleShareLink(shareUrl)
  }

  const handleShareResults = async (pollTitle: string, pollId: number) => {
    const shareUrl = `${appUrl}/poll/${pollId}/results`
    await handleShareLink(shareUrl)
  }

  const handleShareLink = async (link: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ url: link })
        console.log('Link shared successfully')
      } catch (err) {
        console.error('Share canceled or failed', err)
      }
    } else {
      setShareUrl(link)
      setIsOpen(true)
    }
  }
  return { isOpen, setIsOpen, handleSharePoll, handleShareResults, shareUrl }
}
