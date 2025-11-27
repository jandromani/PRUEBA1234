'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { ArrowLeft, MoreVertical, PlusIcon } from './icon-components'

interface IHeaderProps {
  backUrl?: string
  title?: string
  isCreatePoll?: boolean
  onBackClick?: () => void
}

export default function Header({
  backUrl,
  title = 'All Polls',
  isCreatePoll = false,
  onBackClick,
}: IHeaderProps) {
  const router = useRouter()

  const goBack = () => {
    sendHapticFeedbackCommand()
    if (backUrl) {
      router.push(backUrl)
    } else if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex items-center justify-between mt-2 mb-8">
      {onBackClick ? (
        <button
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
          onClick={onBackClick}
        >
          <ArrowLeft />
        </button>
      ) : (
        <button
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300/90 active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
          onClick={goBack}
        >
          <ArrowLeft />
        </button>
      )}
      <h1 className="text-xl font-medium text-gray-900">{title}</h1>
      {isCreatePoll ? (
        <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300/90 active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100">
          <MoreVertical />
        </button>
      ) : (
        <Link
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300/90 active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
          href="/poll/create"
          onClick={() => sendHapticFeedbackCommand()}
        >
          <PlusIcon color="#3C424B" />
        </Link>
      )}
    </div>
  )
}
