import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useGetPolls } from '@/hooks/usePoll'
import { useToast } from '@/hooks/useToast'
import { FilterParams, IPoll, PollSortBy } from '@/types/poll'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { PlusIcon } from '../icon-components'
import { Toaster } from '../Toaster'
import BlurredCard from '../Verify/BlurredCard'
import NoPollsView from './NoPollsView'
import { LazyPollCard } from './PollCard'

export default function RecentPolls() {
  const { toast } = useToast()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: pollsData,
    isLoading,
    error,
    refetch,
  } = useGetPolls({
    isActive: true,
    sortBy: PollSortBy.END_DATE,
  })

  const polls = pollsData?.polls || []

  // Auto-refresh polls every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        handleRefresh()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(refreshInterval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const showErrorToast = () => {
    toast({
      description: 'Error loading polls. Please try again!',
      duration: 5 * 60 * 1000,
    })
  }

  useEffect(() => {
    if (error) showErrorToast()
  }, [error])

  return (
    <section className="mb-6" aria-labelledby="recent-polls-heading">
      <div className="flex justify-between items-center mb-6">
        <h2
          id="recent-polls-heading"
          className="text-gray-900 text-lg font-medium"
        >
          Recent Polls
        </h2>

        {isRefreshing && <p className="text-gray-500 text-sm">Refreshing...</p>}
      </div>

      {renderContent()}

      <Toaster />
    </section>
  )

  function renderContent() {
    if (isLoading || error) return <LoadingPolls />

    if (!polls || polls.length === 0) return <NoPollsView />

    return (
      <>
        <div className="space-y-4 mb-6" aria-label="Poll list">
          {polls.map((poll: IPoll) => (
            <LazyPollCard key={poll.pollId} poll={poll} />
          ))}
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Link
            className="py-3 bg-gray-300 text-primary font-medium rounded-lg flex items-center justify-center active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
            href={`/polls?filter=${FilterParams.All}`}
            onClick={() => sendHapticFeedbackCommand()}
          >
            Explore all
          </Link>

          <Link
            className="py-3 bg-primary text-white text-lg font-medium rounded-lg flex items-center justify-center gap-2 active:scale-95 active:bg-primary/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
            href="/poll/create"
            onClick={() => sendHapticFeedbackCommand()}
          >
            <PlusIcon />
            Create a New Poll
          </Link>
        </div>
      </>
    )
  }
}

const LoadingPolls = () => {
  return (
    <div className="space-y-4" aria-label="Loading polls">
      {Array.from({ length: 4 }).map((_, index) => (
        <BlurredCard key={index} />
      ))}
    </div>
  )
}
