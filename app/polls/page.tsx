'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import FilterModal, { DEFAULT_FILTERS } from '@/components/Modals/FilterModal'
import PollList from '@/components/Poll/PollList'
import { FilterParams, IPollFilters } from '@/types/poll'

export default function PollsPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') as FilterParams

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<IPollFilters>(DEFAULT_FILTERS)

  useEffect(() => {
    if (filter === FilterParams.Voted) {
      setFilters({
        ...DEFAULT_FILTERS,
        pollsVoted: true,
      })
    }
  }, [filter])

  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header />
      <FilterModal
        filters={filters}
        setFilters={setFilters}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />
      <PollList
        filters={filters}
        filterParam={filter}
        setFiltersOpen={setFiltersOpen}
      />
    </main>
  )
}
