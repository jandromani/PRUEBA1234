import { useEffect, useState } from 'react'
import { DAYS_OF_WEEK } from '@/lib/constants'
import { DateObj, DateRange, DateTimePickerProps } from '@/types/dateTimePicker'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { formatDate } from '@/utils/time'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from '../icon-components'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { CalendarDay } from './CalendarDay'
import { TimePicker } from './TimePicker'

export default function DateTimePicker({
  open,
  onOpenChange,
  onApply,
  initialStartDate = null,
  initialEndDate = null,
  initialStartTime = '13:00',
  initialEndTime = '18:00',
}: DateTimePickerProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Selected date range
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate,
    endDate: initialEndDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
  })

  // Update dateRange when props change
  useEffect(() => {
    setDateRange({
      startDate: initialStartDate,
      endDate: initialEndDate,
      startTime: initialStartTime,
      endTime: initialEndTime,
    })

    // If an end date is provided, ensure the calendar navigates to show that month
    if (initialEndDate) {
      setCurrentDate(new Date(initialEndDate))
    }
  }, [initialStartDate, initialEndDate, initialStartTime, initialEndTime, open])

  // Time picker state
  const [timePickerOpen, setTimePickerOpen] = useState<'end' | null>(null)

  // Navigate to previous month
  const previousMonth = () => {
    sendHapticFeedbackCommand()
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }

  // Navigate to next month
  const nextMonth = () => {
    sendHapticFeedbackCommand()
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }

  // Handle date click
  const handleDateClick = (day: number, month: number, year: number) => {
    sendHapticFeedbackCommand()
    const clickedDate = new Date(year, month, day)

    if (clickedDate <= today) {
      return
    }

    setDateRange({
      ...dateRange,
      endDate: clickedDate,
    })
  }

  // Handle time selection
  const handleTimeChange = (hours: number, minutes: number) => {
    sendHapticFeedbackCommand()
    const formattedHours = hours.toString().padStart(2, '0')
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const timeString = `${formattedHours}:${formattedMinutes}`

    setDateRange(prev => ({
      ...prev,
      endTime: timeString,
    }))
  }

  // Handle apply button click
  const handleApply = () => {
    sendHapticFeedbackCommand()
    onApply(dateRange)
    onOpenChange(false)
  }

  // Get calendar data for current month view
  const getCalendarData = (): DateObj[][] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1)

    // Get day of week for first day (0 = Sunday, so we adjust for Monday start)
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1
    if (firstDayOfWeek < 0) firstDayOfWeek = 6 // Sunday becomes last day

    // Get last day of month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

    // Get last day of previous month
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate()

    const calendarDays: DateObj[] = []

    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth - i
      const prevMonth = month - 1 < 0 ? 11 : month - 1
      const prevYear = prevMonth === 11 ? year - 1 : year
      calendarDays.push({ day, month: prevMonth, year: prevYear })
    }

    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth; i++) {
      calendarDays.push({ day: i, month, year })
    }

    // Add days from next month
    const remainingDays = 42 - calendarDays.length // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month + 1 > 11 ? 0 : month + 1
      const nextYear = nextMonth === 0 ? year + 1 : year
      calendarDays.push({ day: i, month: nextMonth, year: nextYear })
    }

    // Split into weeks
    const weeks: DateObj[][] = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    return weeks
  }

  // Check if a date is in the selected range
  const isInRange = (day: number, month: number, year: number): boolean => {
    if (!dateRange.startDate || !dateRange.endDate) return false

    const date = new Date(year, month, day)
    return date >= dateRange.startDate && date <= dateRange.endDate
  }

  // Check if a date is the start or end of the range
  const isRangeEdge = (
    day: number,
    month: number,
    year: number,
    edge: 'start' | 'end',
  ): boolean => {
    if (!dateRange.startDate || (edge === 'end' && !dateRange.endDate))
      return false

    const date = new Date(year, month, day)
    const compareDate =
      edge === 'start' ? dateRange.startDate : dateRange.endDate

    if (!compareDate) return false
    return date.getTime() === compareDate.getTime()
  }

  // Check if a date should be disabled (current date or past dates)
  const isDateDisabled = (
    day: number,
    month: number,
    year: number,
  ): boolean => {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    return date <= today
  }

  // Get current month and year for display
  const currentMonthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
  }).format(currentDate)
  const currentYear = currentDate.getFullYear()

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      className="p-0 rounded-xl max-w-md"
    >
      <div className="p-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={previousMonth}
            className="p-2 rounded-full disabled:opacity-25"
            disabled={currentDate.getMonth() === today.getMonth()}
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </button>
          <h2 className="font-medium text-gray-900">
            {currentMonthName} {currentYear}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-full"
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Date range inputs */}
        <div className="flex items-center mb-6">
          <div className="flex-1">
            <div className="w-full border border-gray-300 rounded-lg p-4 text-left cursor-not-allowed">
              <div className="text-gray-400 text-sm">
                {formatDate(dateRange.startDate)}
              </div>
            </div>
          </div>
          <div className="mx-2 text-gray-400">—</div>
          <div className="flex-1">
            <button
              type="button"
              className="w-full border border-gray-300 rounded-lg p-4 bg-transparent text-left"
              disabled={!dateRange.startDate}
            >
              <div className="text-gray-900 text-sm">
                {dateRange.endDate
                  ? formatDate(dateRange.endDate)
                  : 'Select end date'}
              </div>
            </button>
          </div>
        </div>

        {/* Time range inputs */}
        <div className="flex items-center mb-8">
          <div className="flex-1">
            <div className="w-full border border-gray-300 rounded-lg p-4 text-left cursor-not-allowed flex items-center gap-2">
              <ClockIcon />
              <div className="text-gray-400 text-sm">Now</div>
            </div>
          </div>

          <div className="mx-2 text-gray-400">—</div>

          <TimePicker
            time={dateRange.endTime}
            isOpen={timePickerOpen === 'end'}
            onTimeChange={(hours, minutes) => handleTimeChange(hours, minutes)}
            onToggle={() =>
              setTimePickerOpen(prev => (prev === 'end' ? null : 'end'))
            }
          />
        </div>

        {/* Calendar */}
        <div>
          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={index}
                className="text-center py-2 text-gray-700 font-medium text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {getCalendarData().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((dateObj, dayIndex) => (
                <CalendarDay
                  key={dayIndex}
                  dateObj={dateObj}
                  isCurrentMonth={dateObj.month === currentDate.getMonth()}
                  isInSelectedRange={isInRange(
                    dateObj.day,
                    dateObj.month,
                    dateObj.year,
                  )}
                  isRangeStart={isRangeEdge(
                    dateObj.day,
                    dateObj.month,
                    dateObj.year,
                    'start',
                  )}
                  isRangeEnd={isRangeEdge(
                    dateObj.day,
                    dateObj.month,
                    dateObj.year,
                    'end',
                  )}
                  isFirstInWeek={dayIndex === 0}
                  isLastInWeek={dayIndex === 6}
                  isDisabled={isDateDisabled(
                    dateObj.day,
                    dateObj.month,
                    dateObj.year,
                  )}
                  onClick={handleDateClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex border-t border-gray-300 justify-evenly items-center py-4">
        <Button
          type="button"
          variant="outline"
          className="w-5/12 active:scale-95 active:transition-transform active:duration-100"
          onClick={() => {
            sendHapticFeedbackCommand()
            onOpenChange(false)
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="w-5/12 disabled:opacity-50 active:scale-95 active:transition-transform active:duration-100"
          onClick={handleApply}
          disabled={!dateRange.endDate}
        >
          Apply
        </Button>
      </div>
    </Modal>
  )
}
