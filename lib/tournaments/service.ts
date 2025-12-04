import type {
  Answer,
  JoinCallbackPayload,
  JoinRequest,
  Payout,
  PlayerTournament,
  Pot,
  Question,
  Tournament,
  TournamentState,
  TournamentSummary,
} from './types'

const QUESTION_WINDOW_SECONDS = 14

export class TournamentService {
  private tournaments: Map<string, Tournament> = new Map()

  constructor() {
    this.ensureSeedData()
  }

  getActiveTournaments(): TournamentSummary[] {
    const now = Date.now()
    const summaries = Array.from(this.tournaments.values())
      .filter(tournament => {
        this.applyStateProgression(tournament, now)
        return tournament.state !== 'settled'
      })
      .map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        startAt: tournament.startAt,
        state: tournament.state,
        pot: tournament.pot,
        questionCount: tournament.questions.length,
      }))

    return summaries.sort((a, b) => a.startAt - b.startAt)
  }

  getTournament(tournamentId: string): Tournament | undefined {
    const tournament = this.tournaments.get(tournamentId)
    if (tournament) {
      this.applyStateProgression(tournament, Date.now())
    }
    return tournament
  }

  joinTournament(tournamentId: string, payload: JoinRequest): Tournament {
    const tournament = this.requireTournament(tournamentId)
    this.applyStateProgression(tournament, Date.now())

    if (tournament.state !== 'open') {
      throw new Error('Tournament is not accepting new players')
    }

    const alreadyJoined = tournament.players.some(
      player => player.playerId === payload.playerId,
    )
    if (alreadyJoined) {
      return tournament
    }

    const contribution = payload.contribution ?? tournament.entryFee
    const newPlayer: PlayerTournament = {
      playerId: payload.playerId,
      joinedAt: Date.now(),
      contribution,
    }
    tournament.players.push(newPlayer)
    tournament.pot.gross += contribution
    tournament.pot.net = this.calculateNetPot(
      tournament.pot.gross,
      tournament.rakePercent,
    )
    return tournament
  }

  handleJoinCallback(
    tournamentId: string,
    payload: JoinCallbackPayload,
  ): Tournament {
    const tournament = this.requireTournament(tournamentId)
    this.applyStateProgression(tournament, Date.now())

    if (tournament.state !== 'open') {
      throw new Error('Tournament is closed for callbacks')
    }

    const alreadyJoined = tournament.players.find(
      player => player.playerId === payload.playerId,
    )

    if (!alreadyJoined) {
      this.joinTournament(tournamentId, {
        playerId: payload.playerId,
        contribution: tournament.entryFee,
      })
    }

    return tournament
  }

  submitAnswer(
    tournamentId: string,
    playerId: string,
    optionIndex: number,
  ): Answer {
    const tournament = this.requireTournament(tournamentId)
    this.applyStateProgression(tournament, Date.now())

    if (tournament.state !== 'in_progress') {
      throw new Error('Tournament is not accepting answers')
    }

    const currentQuestion = this.resolveCurrentQuestion(tournament)
    if (!currentQuestion) {
      throw new Error('No active question')
    }

    const answer: Answer = {
      tournamentId,
      playerId,
      questionId: currentQuestion.id,
      optionIndex,
      submittedAt: Date.now(),
    }

    const alreadyAnswered = tournament.answers.find(
      existing =>
        existing.playerId === playerId &&
        existing.questionId === currentQuestion.id,
    )

    if (!alreadyAnswered) {
      tournament.answers.push(answer)
    }

    return answer
  }

  getCurrentQuestion(tournamentId: string): Question | undefined {
    const tournament = this.requireTournament(tournamentId)
    this.applyStateProgression(tournament, Date.now())
    return this.resolveCurrentQuestion(tournament)
  }

  getCurrentQuestionIndex(tournament: Tournament): number | undefined {
    return tournament.currentQuestionIndex
  }

  getTournamentState(tournamentId: string): TournamentState {
    const tournament = this.requireTournament(tournamentId)
    this.applyStateProgression(tournament, Date.now())
    return tournament.state
  }

  getResult(tournamentId: string): Payout[] {
    const tournament = this.requireTournament(tournamentId)
    this.applyStateProgression(tournament, Date.now())

    if (tournament.state !== 'settled') {
      throw new Error('Tournament is not settled yet')
    }

    return tournament.payouts
  }

  scheduleTick(): Tournament[] {
    const now = Date.now()
    const updated: Tournament[] = []
    this.tournaments.forEach(tournament => {
      const prevState = tournament.state
      this.applyStateProgression(tournament, now)
      if (prevState !== tournament.state) {
        updated.push(tournament)
      }
    })
    return updated
  }

  createTournamentFromQuestionSet(
    name: string,
    questionSet: Question[],
  ): Tournament {
    const id = this.generateId()
    const now = Date.now()
    const scheduledAt = now + 60_000
    const openAt = scheduledAt
    const startAt = scheduledAt + 60_000
    const tournament: Tournament = {
      id,
      name,
      questionSetId: `${id}-questionset`,
      state: 'scheduled',
      createdAt: now,
      scheduledAt,
      openAt,
      startAt,
      entryFee: 10,
      rakePercent: 0.1,
      questions: questionSet,
      players: [],
      answers: [],
      pot: {
        gross: 0,
        net: 0,
        rakePercent: 0.1,
      },
      payouts: [],
    }
    this.tournaments.set(id, tournament)
    return tournament
  }

  private ensureSeedData() {
    if (this.tournaments.size > 0) return

    const questions: Question[] = [
      {
        id: 'q1',
        text: '¿Cuál es la capital de Francia?',
        options: ['París', 'Madrid', 'Roma', 'Berlín'],
        correctOption: 0,
      },
      {
        id: 'q2',
        text: '¿Qué planeta es conocido como el planeta rojo?',
        options: ['Marte', 'Júpiter', 'Saturno', 'Mercurio'],
        correctOption: 0,
      },
      {
        id: 'q3',
        text: '¿Cuál es el elemento químico con símbolo O?',
        options: ['Oro', 'Oxígeno', 'Osmio', 'Zinc'],
        correctOption: 1,
      },
    ]

    const tournament = this.createTournamentFromQuestionSet(
      'Trivia Flash',
      questions,
    )
    tournament.scheduledAt = Date.now() - 30_000
    tournament.openAt = tournament.scheduledAt
    tournament.startAt = Date.now() + 30_000
    tournament.state = 'open'
    tournament.pot = {
      gross: 100,
      net: this.calculateNetPot(100, tournament.rakePercent),
      rakePercent: tournament.rakePercent,
    }
  }

  private resolveCurrentQuestion(tournament: Tournament): Question | undefined {
    if (
      tournament.state !== 'in_progress' ||
      tournament.currentQuestionIndex === undefined
    ) {
      return undefined
    }
    return tournament.questions[tournament.currentQuestionIndex]
  }

  private applyStateProgression(tournament: Tournament, now: number) {
    switch (tournament.state) {
      case 'scheduled':
        if (now >= tournament.openAt) {
          tournament.state = 'open'
        }
        break
      case 'open':
        if (now >= tournament.startAt) {
          tournament.state = 'locked'
          tournament.lockedAt = now
        }
        break
      case 'locked':
        if (now >= tournament.startAt) {
          tournament.state = 'in_progress'
          tournament.currentQuestionIndex = 0
          tournament.currentQuestionStart = now
        }
        break
      case 'in_progress':
        this.advanceQuestions(tournament, now)
        break
      case 'finished':
        if (!tournament.settledAt) {
          this.settleTournament(tournament, now)
        }
        break
      case 'settled':
        break
    }
  }

  private advanceQuestions(tournament: Tournament, now: number) {
    const timeout = QUESTION_WINDOW_SECONDS * 1000
    if (tournament.currentQuestionStart === undefined) {
      tournament.currentQuestionStart = now
    }

    const elapsed = now - tournament.currentQuestionStart
    const questionTimeout =
      (tournament.questions[tournament.currentQuestionIndex ?? 0]
        ?.timeoutSeconds ?? QUESTION_WINDOW_SECONDS) * 1000

    if (elapsed >= questionTimeout) {
      const nextIndex = (tournament.currentQuestionIndex ?? 0) + 1
      if (nextIndex >= tournament.questions.length) {
        tournament.state = 'finished'
        tournament.finishedAt = now
      } else {
        tournament.currentQuestionIndex = nextIndex
        tournament.currentQuestionStart = now
      }
    }
  }

  private settleTournament(tournament: Tournament, now: number) {
    const scoreboard = new Map<
      string,
      {
        correct: number
        avgLatency: number
        totalLatency: number
        answers: number
      }
    >()

    tournament.players.forEach(player => {
      scoreboard.set(player.playerId, {
        correct: 0,
        avgLatency: 0,
        totalLatency: 0,
        answers: 0,
      })
    })

    tournament.questions.forEach(question => {
      const submitted = tournament.answers.filter(
        answer => answer.questionId === question.id,
      )
      submitted.forEach(answer => {
        const stats = scoreboard.get(answer.playerId)
        if (!stats) return
        const latency = this.calculateLatency(answer, tournament, question.id)
        if (answer.optionIndex === question.correctOption) {
          stats.correct += 1
        }
        stats.answers += 1
        stats.totalLatency += latency
      })
    })

    const sorted = Array.from(scoreboard.entries())
      .map(([playerId, data]) => ({
        playerId,
        correct: data.correct,
        avgLatency: data.answers > 0 ? data.totalLatency / data.answers : 0,
      }))
      .sort((a, b) => {
        if (a.correct !== b.correct) return b.correct - a.correct
        return a.avgLatency - b.avgLatency
      })

    const payouts: Payout[] = []
    const netPot = tournament.pot.net
    const firstPrize = netPot * 0.6
    const secondPrize = netPot * 0.25
    const thirdPrize = netPot * 0.15

    sorted.forEach((entry, index) => {
      let amount = 0
      if (index === 0) amount = firstPrize
      else if (index === 1) amount = secondPrize
      else if (index === 2) amount = thirdPrize

      payouts.push({
        playerId: entry.playerId,
        amount,
        rank: index + 1,
        correct: entry.correct,
        avgLatency: entry.avgLatency,
      })
    })

    tournament.payouts = payouts
    tournament.state = 'settled'
    tournament.settledAt = now
  }

  private calculateLatency(
    answer: Answer,
    tournament: Tournament,
    questionId: string,
  ) {
    const questionIndex = tournament.questions.findIndex(
      q => q.id === questionId,
    )
    const startAt = tournament.currentQuestionStart ?? tournament.startAt
    const questionStart =
      startAt +
      (questionIndex > 0 ? questionIndex * QUESTION_WINDOW_SECONDS * 1000 : 0)
    return Math.max(0, answer.submittedAt - questionStart)
  }

  private calculateNetPot(gross: number, rakePercent: number): number {
    return Math.max(0, gross - gross * rakePercent)
  }

  private generateId() {
    return Math.random().toString(36).slice(2, 10)
  }

  private requireTournament(tournamentId: string): Tournament {
    const tournament = this.getTournament(tournamentId)
    if (!tournament) {
      throw new Error(`Tournament ${tournamentId} not found`)
    }
    return tournament
  }
}

let singleton: TournamentService | null = null

export const getTournamentService = () => {
  if (!singleton) {
    singleton = new TournamentService()
  }
  return singleton
}

export const parseJson = async <T>(request: Request): Promise<T> => {
  const body = await request.json()
  return body as T
}
