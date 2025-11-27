import { CalendarDayProps } from '@/types/dateTimePicker'
import { cn } from '@/utils'

export const CalendarDay = ({
  dateObj,
  isCurrentMonth,
  isInSelectedRange,
  isRangeStart,
  isRangeEnd,
  isFirstInWeek,
  isLastInWeek,
  isDisabled,
  onClick,
}: CalendarDayProps) => {
  const { day, month, year } = dateObj

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!isDisabled) {
      onClick(day, month, year)
    }
  }

  return (
    <div
      className={cn(
        'relative h-12 flex items-center justify-center',
        isInSelectedRange && 'bg-gray-200',
        isInSelectedRange && isFirstInWeek && 'rounded-l-full',
        isInSelectedRange && isLastInWeek && 'rounded-r-full',
        isRangeStart && 'rounded-l-full',
        isRangeEnd && 'rounded-r-full',
      )}
    >
      <button
        type="button"
        className={cn(
          'flex items-center justify-center w-12 h-12 relative rounded-full transition-colors',
          isRangeEnd && 'bg-gray-900 text-white',
          isRangeStart && 'bg-gray-400 text-white',
          !isCurrentMonth && 'text-gray-300',
          isDisabled && 'cursor-not-allowed',
        )}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={`${day} ${new Intl.DateTimeFormat('en-US', {
          month: 'long',
        }).format(new Date(year, month, 1))}, ${year}`}
        aria-pressed={isRangeStart || isRangeEnd}
      >
        {day}
      </button>
    </div>
  )
}
