import { getTournamentService } from '@/lib/tournaments/service'
import type { Question } from '@/lib/tournaments/types'

export interface ScheduledController {
  scheduled: (
    event: ScheduledEvent,
    env: Record<string, unknown>,
    ctx: ExecutionContext,
  ) => Promise<void>
}

interface ScheduledEvent {
  readonly cron: string
}

interface ExecutionContext {
  waitUntil: (promise: Promise<unknown>) => void
}

export const CronHandlers: ScheduledController = {
  scheduled: async (_event, _env, ctx) => {
    const service = getTournamentService()
    const updates = service.scheduleTick()
    ctx.waitUntil(Promise.resolve(updates))
  },
}

export const createDailyTournament = (
  name: string,
  questions: Question[],
  hourUtc: number,
  minuteUtc: number,
) => {
  const now = new Date()
  const scheduled = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hourUtc,
      minuteUtc,
      0,
    ),
  )
  const delay = scheduled.getTime() - now.getTime()
  const startsToday = delay > 0 ? delay : 24 * 60 * 60 * 1000 + delay

  setTimeout(() => {
    getTournamentService().createTournamentFromQuestionSet(name, questions)
  }, startsToday)
}
