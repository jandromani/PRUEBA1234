export type DateObj = {
  day: number
  month: number
  year: number
}

export type DateRange = {
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
}

export type DateTimePickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (values: DateRange) => void
  initialStartDate?: Date | null
  initialEndDate?: Date | null
  initialStartTime?: string
  initialEndTime?: string
}

export type TimePickerProps = {
  time: string
  isOpen: boolean
  onTimeChange: (hours: number, minutes: number) => void
  onToggle: () => void
  className?: string
}

export type CalendarDayProps = {
  dateObj: DateObj
  isCurrentMonth: boolean
  isInSelectedRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isFirstInWeek: boolean
  isLastInWeek: boolean
  isDisabled: boolean
  onClick: (day: number, month: number, year: number) => void
}
