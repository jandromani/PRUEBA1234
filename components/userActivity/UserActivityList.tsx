'use client'

import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { useUserActivities } from '@/hooks/useUserActivity'
import { transformActionToTournament } from '@/utils/helpers'
import TournamentCard from '../Tournament/TournamentCard'
import FilterBar from '../FilterBar'
import { Toaster } from '../Toaster'

export default function UserActivityList() {
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
    search: searchTerm || undefined,
  })

  const userActions = userActivitiesData?.actions || []

  const showErrorToast = () => {
    toast({
      description: 'Error loading tournament activity. Please try again!',
      duration: 5 * 60 * 1000,
    })
  }

  useEffect(() => {
    if (error) showErrorToast()
  }, [error])

  return (
    <section aria-label="Tournament activity" className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FilterBar setFiltersOpen={() => {}} onSearch={handleSearch} initialSearchTerm={searchTerm} />
      </motion.div>
      {renderContent()}
      <Toaster />
    </section>
  )

  function renderContent() {
    if (isLoading || error) {
      return <p className="text-gray-500">Loading activity...</p>
    }

    if (!userActions || userActions.length === 0) {
      return <p className="text-gray-500">No tournament activity available.</p>
    }

    return (
      <div className="space-y-4">
        {userActions.map(userAction => (
          <TournamentCard
            key={userAction.id}
            tournament={transformActionToTournament(userAction)}
          />
        ))}
      </div>
    )
  }
}
