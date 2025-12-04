import { useEffect, useRef, useState } from 'react'

interface TimerPayload {
  remainingSeconds?: number
  serverNow?: number
  deadlineEpochMs?: number
}

interface UseOfficialTimerParams {
  pollId?: number
  durationSeconds?: number
}

const DEFAULT_DURATION = 14

export const useOfficialTimer = ({
  pollId,
  durationSeconds = DEFAULT_DURATION,
}: UseOfficialTimerParams) => {
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(durationSeconds)
  const syncRef = useRef<{
    remainingSeconds: number
    timestamp: number
  } | null>(null)
  const deadlineRef = useRef<number | null>(null)

  useEffect(() => {
    setRemainingSeconds(durationSeconds)
    syncRef.current = {
      remainingSeconds: durationSeconds,
      timestamp: Date.now(),
    }
    deadlineRef.current = null
  }, [durationSeconds, pollId])

  useEffect(() => {
    if (!pollId) return

    let eventSource: EventSource | null = null

    const parsePayload = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data ?? '{}') as TimerPayload
        return parsed
      } catch (error) {
        return {} as TimerPayload
      }
    }

    const handleSync = (payload: TimerPayload) => {
      const serverNow = payload.serverNow ?? Date.now()

      if (typeof payload.deadlineEpochMs === 'number') {
        deadlineRef.current = payload.deadlineEpochMs
        const remainingMs = payload.deadlineEpochMs - serverNow
        const remaining = Math.max(0, Math.ceil(remainingMs / 1000))
        syncRef.current = {
          remainingSeconds: remaining,
          timestamp: serverNow,
        }
        setRemainingSeconds(remaining)
        return
      }

      if (typeof payload.remainingSeconds === 'number') {
        const safeRemaining = Math.max(0, Math.round(payload.remainingSeconds))
        syncRef.current = {
          remainingSeconds: safeRemaining,
          timestamp: serverNow,
        }
        setRemainingSeconds(safeRemaining)
      }
    }

    try {
      eventSource = new EventSource(`/poll/${pollId}/timer`)
      eventSource.onmessage = event => handleSync(parsePayload(event))
      eventSource.onerror = () => {
        eventSource?.close()
        eventSource = null
      }
    } catch (error) {
      eventSource = null
    }

    const syncInterval = setInterval(() => {
      const referenceNow = Date.now()

      if (deadlineRef.current) {
        const remainingMs = deadlineRef.current - referenceNow
        const nextRemaining = Math.max(0, Math.ceil(remainingMs / 1000))
        setRemainingSeconds(nextRemaining)
        return
      }

      if (syncRef.current) {
        const elapsedSeconds = (referenceNow - syncRef.current.timestamp) / 1000
        const nextRemaining = Math.max(
          0,
          Math.ceil(syncRef.current.remainingSeconds - elapsedSeconds),
        )
        setRemainingSeconds(nextRemaining)
      }
    }, 250)

    return () => {
      eventSource?.close()
      clearInterval(syncInterval)
    }
  }, [pollId])

  const isExpired = remainingSeconds <= 0

  return { remainingSeconds, isExpired }
}
