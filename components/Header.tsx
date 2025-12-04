'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { ArrowLeft } from './icon-components'

interface IHeaderProps {
  backUrl?: string
  title?: string
  actionLabel?: string
  actionHref?: string
}

export default function Header({
  backUrl,
  title = 'Tournaments',
  actionHref,
  actionLabel,
}: IHeaderProps) {
  const router = useRouter()

  const goBack = () => {
    sendHapticFeedbackCommand()
    if (backUrl) {
      router.push(backUrl)
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/tournaments')
    }
  }

  return (
    <div className="flex items-center justify-between mt-2 mb-8">
      <button
        className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300/90 active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
        onClick={goBack}
      >
        <ArrowLeft />
      </button>
      <h1 className="text-xl font-medium text-gray-900">{title}</h1>
      {actionHref && actionLabel ? (
        <Link
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 active:scale-95 active:transition-transform active:duration-100"
          href={actionHref}
          onClick={() => sendHapticFeedbackCommand()}
        >
          {actionLabel}
        </Link>
      ) : (
        <div className="w-10 h-10" />
      )}
    </div>
  )
}
