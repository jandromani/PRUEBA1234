import { MONTHS } from '@/lib/constants'

const formatTimeDifference = (timeDiff: number): string => {
  const absDiff = Math.abs(timeDiff)

  const minutes = Math.floor(absDiff / (1000 * 60))
  const hours = Math.floor(absDiff / (1000 * 60 * 60))
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)

  if (days >= 60) {
    const remainingDays = days % 30
    return remainingDays > 0 ? `${months}m ${remainingDays}d` : `${months}m`
  } else if (days >= 1) {
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  } else if (hours >= 1) {
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  } else {
    return `${minutes}m`
  }
}

export const getRelativeTimeString = (
  startDate: string,
  endDate: string,
): { timeLeft: string; isEnded: boolean; isNotStarted: boolean } => {
  if (!startDate || !endDate) {
    return {
      timeLeft: 'Ended',
      isEnded: true,
      isNotStarted: false,
    }
  }

  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Check if poll hasn't started yet
  if (start > now) {
    const diff = start.getTime() - now.getTime()
    const timeLeft = formatTimeDifference(diff)

    return {
      timeLeft,
      isEnded: false,
      isNotStarted: true,
    }
  }

  // Check if poll has ended
  if (end < now) {
    return {
      timeLeft: 'Ended',
      isEnded: true,
      isNotStarted: false,
    }
  }

  // Poll is active - calculate time left until end
  const diff = end.getTime() - now.getTime()
  const timeLeft = formatTimeDifference(diff)

  return {
    timeLeft,
    isEnded: false,
    isNotStarted: false,
  }
}

export const formatDate = (date: Date | null): string => {
  if (!date) return ''
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export const formatShortDate = (date: Date | null): string => {
  if (!date) return '-'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export const parseTime = (
  timeString: string,
): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return { hours, minutes }
}

export const combineDateTime = (date: Date, timeString: string) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  const newDate = new Date(date)
  newDate.setHours(hours, minutes, 0, 0)
  return newDate
}
