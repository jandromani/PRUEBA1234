import { useEffect, useRef } from 'react'
import { TimePickerProps } from '@/types/dateTimePicker'
import { cn } from '@/utils'
import { parseTime } from '@/utils/time'
import { ClockIcon } from '../icon-components'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

export const TimePicker = ({
  time,
  isOpen,
  onTimeChange,
  onToggle,
  className,
}: TimePickerProps) => {
  const timePickerRef = useRef<HTMLDivElement>(null)
  const timeValues = parseTime(time)

  // Close time picker when clicking outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target as Node)
      ) {
        onToggle()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  return (
    <div className={cn('flex-1 relative', className)} ref={timePickerRef}>
      <button
        type="button"
        className={cn(
          'w-full border rounded-lg p-4 bg-transparent flex items-center gap-2',
          isOpen ? 'border-gray-500' : 'border-gray-300',
        )}
        onClick={onToggle}
      >
        <ClockIcon />
        <div className="text-gray-900 text-sm">{time}</div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-3 flex">
            {/* Hours */}
            <div className="flex-1 pr-2 border-r border-gray-300">
              <div className="text-xs text-gray-500 font-medium mb-2 text-center">
                Hours
              </div>
              <div className="h-48 overflow-y-auto flex flex-col items-center">
                {HOURS.map(hour => (
                  <button
                    type="button"
                    key={hour}
                    className={cn(
                      'w-full py-2 text-center rounded-md',
                      hour === timeValues.hours
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-500 hover:bg-gray-100',
                    )}
                    onClick={e => {
                      e.stopPropagation()
                      onTimeChange(hour, timeValues.minutes)
                    }}
                  >
                    {hour.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 pl-2">
              <div className="text-xs text-gray-500 font-medium mb-2 text-center">
                Minutes
              </div>
              <div className="h-48 overflow-y-auto flex flex-col items-center">
                {MINUTES.map(minute => (
                  <button
                    type="button"
                    key={minute}
                    className={cn(
                      'w-full py-2 text-center rounded-md',
                      minute === timeValues.minutes
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-500 hover:bg-gray-100',
                    )}
                    onClick={e => {
                      e.stopPropagation()
                      onTimeChange(timeValues.hours, minute)
                    }}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
