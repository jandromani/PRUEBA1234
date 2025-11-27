'use client'

import { useEffect, useState } from 'react'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { FilterHorizontal, SearchIcon } from './icon-components'
interface FilterBarProps {
  setFiltersOpen: (open: boolean) => void
  onSearch: (searchTerm: string) => void
  initialSearchTerm?: string
}

const DEBOUNCE_TIME = 800

export default function FilterBar({
  setFiltersOpen,
  onSearch,
  initialSearchTerm = '',
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, DEBOUNCE_TIME)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1 bg-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <button className="w-6 h-6 flex items-center justify-center">
          <SearchIcon />
        </button>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          className="bg-transparent flex-1 outline-none text-gray-900 placeholder-gray-400"
        />
      </div>
      <button
        className="bg-gray-900 rounded-xl p-4"
        onClick={() => {
          sendHapticFeedbackCommand()
          setFiltersOpen(true)
        }}
      >
        <FilterHorizontal />
      </button>
    </div>
  )
}
