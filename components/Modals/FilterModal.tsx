import { useEffect, useState } from 'react'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import BottomModal from '../ui/BottomModal'
import CustomCheckbox from '../ui/CustomCheckbox'

export interface TournamentFilters {
  openLobbies: boolean
  liveMatches: boolean
  completed: boolean
  joined: boolean
}

interface FilterModalProps {
  filters: TournamentFilters
  setFilters: (filters: TournamentFilters) => void
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
}

export const DEFAULT_FILTERS: TournamentFilters = {
  openLobbies: false,
  liveMatches: false,
  completed: false,
  joined: false,
}

export default function FilterModal({
  filters,
  setFilters,
  filtersOpen,
  setFiltersOpen,
}: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState<TournamentFilters>(filters)

  const applyFilters = () => {
    setFilters(tempFilters)
    setFiltersOpen(false)
  }

  const resetFilters = () => {
    setTempFilters(DEFAULT_FILTERS)
  }

  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  return (
    <BottomModal modalOpen={filtersOpen} setModalOpen={setFiltersOpen}>
      <h2 className="text-xl font-medium text-center mb-8">Select filters</h2>

      <div className="space-y-4">
        <CustomCheckbox
          id="lobbies"
          label="Open lobbies"
          checked={tempFilters.openLobbies}
          onChange={checked => {
            sendHapticFeedbackCommand({ type: 'selectionChanged' })
            setTempFilters({ ...tempFilters, openLobbies: checked })
          }}
        />
        <CustomCheckbox
          id="live"
          label="Live matches"
          checked={tempFilters.liveMatches}
          onChange={checked => {
            sendHapticFeedbackCommand({ type: 'selectionChanged' })
            setTempFilters({ ...tempFilters, liveMatches: checked })
          }}
        />
        <CustomCheckbox
          id="complete"
          label="Completed"
          checked={tempFilters.completed}
          onChange={checked => {
            sendHapticFeedbackCommand({ type: 'selectionChanged' })
            setTempFilters({ ...tempFilters, completed: checked })
          }}
        />
        <CustomCheckbox
          id="joined"
          label="Joined"
          checked={tempFilters.joined}
          onChange={checked => {
            sendHapticFeedbackCommand({ type: 'selectionChanged' })
            setTempFilters({ ...tempFilters, joined: checked })
          }}
        />
      </div>

      <button
        className="w-full bg-gray-900 text-white rounded-lg py-4 mt-8 text-sm font-medium font-sora disabled:bg-gray-200 disabled:text-gray-500 active:scale-95 active:transition-transform active:duration-100"
        onClick={applyFilters}
        onTouchStart={() => sendHapticFeedbackCommand()}
        disabled={
          tempFilters.openLobbies === filters.openLobbies &&
          tempFilters.liveMatches === filters.liveMatches &&
          tempFilters.completed === filters.completed &&
          tempFilters.joined === filters.joined
        }
      >
        Apply Filters
      </button>

      <button
        className="w-full text-center text-gray-500 mt-4 py-2 text-sm font-semibold font-sora active:scale-95 active:transition-transform active:duration-100"
        onClick={resetFilters}
        onTouchStart={() => sendHapticFeedbackCommand()}
      >
        Reset
      </button>
    </BottomModal>
  )
}
