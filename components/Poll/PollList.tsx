'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useGetPolls } from '@/hooks/usePoll'
import { useToast } from '@/hooks/useToast'
import {
  containerVariants,
  loadMoreVariants,
} from '@/lib/constants/animationVariants'
import { FilterParams, IPoll, IPollFilters, PollSortBy } from '@/types/poll'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import FilterBar from '../FilterBar'
import { Toaster } from '../Toaster'
import { Button } from '../ui/Button'
import BlurredCard from '../Verify/BlurredCard'
import NoPollsView from './NoPollsView'
import { LazyPollCard } from './PollCard'

const POLLS_PER_PAGE = 20

interface PollListProps {
  filters: IPollFilters
  filterParam: FilterParams
  setFiltersOpen: (open: boolean) => void
}

export default function PollList({
  filters,
  filterParam,
  setFiltersOpen,
}: PollListProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [displayedPolls, setDisplayedPolls] = useState<IPoll[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState<PollSortBy>(PollSortBy.CREATION_DATE)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  // Reset to first page and clear displayed polls when filters or search change
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedPolls([])
  }, [filters, searchTerm])

  const checkIsActive = () => {
    if (filters.livePolls && filters.finishedPolls) return 'none'
    if (!filters.livePolls && !filters.finishedPolls) return undefined
    if (filters.livePolls && !filters.finishedPolls) return true
    if (!filters.livePolls && filters.finishedPolls) return false
    return undefined
  }

  useEffect(() => {
    if (filterParam === FilterParams.Recent) {
      setSortBy(PollSortBy.CREATION_DATE)
    }
    if (filterParam === FilterParams.Trending) {
      setSortBy(PollSortBy.PARTICIPANT_COUNT)
    }
    if (filterParam === FilterParams.All) {
      setSortBy(PollSortBy.CLOSEST_END_DATE)
    }
  }, [filterParam])

  const {
    data: pollsData,
    isLoading,
    error,
  } = useGetPolls({
    page: currentPage,
    limit: POLLS_PER_PAGE,
    sortBy,
    isActive: checkIsActive(),
    userVoted: filters.pollsVoted,
    userCreated: filters.pollsCreated,
    search: searchTerm || undefined,
  })

  // Extract polls and metadata
  const polls = pollsData?.polls || []
  const totalItems = pollsData?.total || 0

  // Update displayed polls when data changes
  useEffect(() => {
    if (polls && polls.length > 0) {
      setDisplayedPolls(prev => [...prev, ...polls])
    }
  }, [polls, currentPage])

  // Calculate total pages when data changes
  useEffect(() => {
    if (totalItems > 0) {
      setTotalPages(Math.ceil(totalItems / POLLS_PER_PAGE))
    } else {
      setTotalPages(1)
    }
  }, [totalItems])

  // Handle Load More functionality
  const handleLoadMore = async () => {
    if (currentPage < totalPages) {
      setIsLoadingMore(true)
      setCurrentPage(prev => prev + 1)
      setIsLoadingMore(false)
    }
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
      {renderPagination()}
      <Toaster />
    </section>
  )

  function renderContent() {
    if ((isLoading && currentPage === 1) || error) {
      return <LoadingPolls />
    }

    if (!displayedPolls || displayedPolls.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <NoPollsView />
        </motion.div>
      )
    }

    return (
      <div className="space-y-4">
        {displayedPolls.map((poll: IPoll, index: number) => (
          <LazyPollCard key={poll.pollId} poll={poll} />
        ))}

        {isLoadingMore && <BlurredCard />}
      </div>
    )
  }

  function renderPagination() {
    if (
      (isLoading && currentPage === 1) ||
      error ||
      !displayedPolls ||
      displayedPolls.length === 0 ||
      totalPages <= 1
    ) {
      return null
    }

    return currentPage < totalPages ? (
      <motion.div
        className="mt-6"
        variants={loadMoreVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            onClick={handleLoadMore}
            onTouchStart={() => sendHapticFeedbackCommand()}
            disabled={isLoadingMore || currentPage >= totalPages}
            className="w-full py-3 active:scale-95 active:transition-transform active:duration-100"
          >
            {isLoadingMore ? 'Loading...' : 'Load More Polls'}
          </Button>
        </motion.div>
        <motion.div
          className="text-center text-sm text-gray-500 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Showing {displayedPolls.length} of {totalItems} polls
        </motion.div>
      </motion.div>
    ) : (
      <motion.div
        className="text-center text-sm text-gray-500 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        All polls loaded ({totalItems} polls)
      </motion.div>
    )
  }
}

export const LoadingPolls = () => {
  return (
    <motion.div
      className="space-y-4"
      aria-label="Loading polls"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <BlurredCard key={index} />
      ))}
    </motion.div>
  )
}
