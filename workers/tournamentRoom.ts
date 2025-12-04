import type { Answer, Question, TournamentState } from '@/lib/tournaments/types'

interface DurableObjectState {
  storage: DurableObjectStorage
  blockConcurrencyWhile: (callback: () => Promise<void>) => Promise<void>
  waitUntil: (promise: Promise<unknown>) => void
}

interface DurableObjectStorage {
  get: (key: string) => Promise<unknown>
  put: (key: string, value: unknown) => Promise<void>
  delete: (key: string) => Promise<void>
}

interface DurableExecutionContext {
  waitUntil: (promise: Promise<unknown>) => void
}

interface FetchRequest extends Request {
  json: () => Promise<unknown>
}

interface TournamentRoomState {
  state: TournamentState
  currentQuestionIndex: number
  currentQuestionStart: number
  questions: Question[]
  answers: Answer[]
}

const QUESTION_WINDOW_SECONDS = 14

export class TournamentRoom {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(
    request: FetchRequest,
    ctx: DurableExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname.split('/').pop()

    if (request.method === 'GET' && path === 'state') {
      const snapshot = await this.readState()
      return Response.json(snapshot)
    }

    if (request.method === 'POST' && path === 'answer') {
      const payload = (await request.json()) as Answer
      const updated = await this.appendAnswer(payload)
      ctx.waitUntil(this.advanceIfExpired())
      return Response.json(updated)
    }

    return new Response('Not found', { status: 404 })
  }

  private async readState(): Promise<TournamentRoomState> {
    const stored = (await this.state.storage.get('state')) as
      | TournamentRoomState
      | undefined
    if (stored) return stored
    return {
      state: 'scheduled',
      currentQuestionIndex: 0,
      currentQuestionStart: Date.now(),
      questions: [],
      answers: [],
    }
  }

  private async writeState(next: TournamentRoomState) {
    await this.state.storage.put('state', next)
  }

  private async appendAnswer(answer: Answer): Promise<TournamentRoomState> {
    const snapshot = await this.readState()
    snapshot.answers.push(answer)
    await this.writeState(snapshot)
    return snapshot
  }

  private async advanceIfExpired() {
    await this.state.blockConcurrencyWhile(async () => {
      const snapshot = await this.readState()
      if (snapshot.state !== 'in_progress') return
      const now = Date.now()
      const elapsed = now - snapshot.currentQuestionStart
      const timeout =
        (snapshot.questions[snapshot.currentQuestionIndex]?.timeoutSeconds ??
          QUESTION_WINDOW_SECONDS) * 1000
      if (elapsed >= timeout) {
        const nextIndex = snapshot.currentQuestionIndex + 1
        if (nextIndex >= snapshot.questions.length) {
          snapshot.state = 'finished'
        } else {
          snapshot.currentQuestionIndex = nextIndex
          snapshot.currentQuestionStart = now
        }
        await this.writeState(snapshot)
      }
    })
  }
}
