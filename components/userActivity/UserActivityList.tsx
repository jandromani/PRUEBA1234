'use client'

import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { useUserActivities } from '@/hooks/useUserActivity'
import { IPollFilters } from '@/types/poll'
import { transformActionToPoll } from '@/utils/helpers'
import FilterBar from '../FilterBar'
import { LazyPollCard } from '../Poll/PollCard'
import { LoadingPolls } from '../Poll/PollList'
import { Toaster } from '../Toaster'
import NoUserActivityView from './NoUserActivityView'

interface UserActivityListProps {
  filters: IPollFilters
  setFiltersOpen: (open: boolean) => void
}

export default function UserActivityList({
  filters,
  setFiltersOpen,
}: UserActivityListProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const { worldId } = useParams()
  const userWorldId = Array.isArray(worldId) ? worldId[0] : (worldId as string)

  const {
    data: userActivitiesData,
    isLoading,
    error,
  } = useUserActivities({
    worldID: userWorldId,
    isActive: filters.livePolls,
    isInactive: filters.finishedPolls,
    isCreated: filters.pollsCreated,
    isParticipated: filters.pollsVoted,
    search: searchTerm || undefined,
  })

  const userActions = userActivitiesData?.userActions || []

  const showErrorToast = () => {
    toast({
      description: 'Error loading user activities. Please try again!',
      duration: 5 * 60 * 1000,
    })
  }

  useEffect(() => {
    if (error) showErrorToast()
  }, [error])

  return (
    <section aria-label="Poll list" className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FilterBar
          setFiltersOpen={setFiltersOpen}
          onSearch={handleSearch}
          initialSearchTerm={searchTerm}
        />
      </motion.div>
      {renderContent()}
      <Toaster />
    </section>
  )

  function renderContent() {
    if (isLoading || error) {
      return <LoadingPolls />
    }

    if (!userActions || userActions.length === 0) {
      return <NoUserActivityView />
    }

    // Remove duplicate user actions based on pollId - where the user has voted on the poll that has been created by the user
    const uniqueUserActions = userActions.filter(
      (userAction, index, self) =>
        index === self.findIndex(t => t.pollId === userAction.pollId),
    )

    return (
      <div className="space-y-4">
        {uniqueUserActions.map(userAction => (
          <LazyPollCard
            key={userAction.pollId}
            poll={transformActionToPoll(userAction)}
          />
        ))}
      </div>
    )
  }
}
