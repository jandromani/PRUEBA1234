'use client'

import Image from 'next/image'
import { useToast } from '@/hooks/useToast'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { Toaster } from '../Toaster'
import BottomModal from '../ui/BottomModal'

export default function CustomShareModal({
  message,
  isOpen,
  setIsOpen,
}: {
  message: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const { toast } = useToast()

  const apps = [
    {
      name: 'WhatsApp',
      icon: '/socials/whatsapp.png',
    },
    {
      name: 'Telegram',
      icon: '/socials/telegram.png',
    },
    {
      name: 'Facebook',
      icon: '/socials/facebook.png',
    },
    {
      name: 'Twitter',
      icon: '/socials/twitter.png',
    },
    // {
    //   name: "Instagram",
    //   icon: "/socials/instagram.png",
    // },
    {
      name: 'Email',
      icon: '/socials/gmail.png',
    },
    {
      name: 'Copy Link',
      icon: '/socials/copy-link.svg',
    },
  ]

  const handleShare = (app: string) => {
    if (app === 'Copy Link') {
      sendHapticFeedbackCommand({ type: 'notification', style: 'success' })
      navigator.clipboard.writeText(message)
      toast({
        description: 'Link copied to clipboard',
        duration: 1000,
      })
      return
    }

    sendHapticFeedbackCommand()
    if (app === 'WhatsApp') {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    }

    if (app === 'Facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        message,
      )}`
      window.open(url, '_blank')
    }

    if (app === 'Twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        message,
      )}`
      window.open(url, '_blank')
    }

    if (app === 'Telegram') {
      const url = `https://t.me/share/url?url=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    }

    if (app === 'Email') {
      const url = `mailto:?body=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    }

    if (app === 'Messages') {
      const url = `sms:?body=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    }

    setIsOpen(false)
  }

  return (
    <>
      <BottomModal modalOpen={isOpen} setModalOpen={setIsOpen}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Image src="/logo.svg" alt="Share" width={42} height={42} />
                <div className="flex flex-col">
                  <p className="text-black font-medium">WorldView</p>
                  <p className="text-sm text-gray-500 font-light">world.org</p>
                </div>
              </h2>
            </div>

            <div className="border-b border-gray-200 pb-2"></div>
          </div>

          <div className="grid grid-cols-4 gap-4 py-2">
            {apps.map(app => (
              <button
                key={app.name}
                onClick={() => handleShare(app.name)}
                className="flex flex-col items-center gap-4 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 rounded-lg touch-manipulation"
                aria-label={`Share via ${app.name}`}
              >
                <Image src={app.icon} alt={app.name} width={42} height={42} />
                <span className="text-xs">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      </BottomModal>

      <Toaster />
    </>
  )
}
