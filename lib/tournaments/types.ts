export type TournamentState =
  | 'scheduled'
  | 'open'
  | 'locked'
  | 'in_progress'
  | 'finished'
  | 'settled'

export interface User {
  id: string
  walletAddress?: string
  displayName: string
}

export interface Tournament {
  id: string
  name: string
  state: TournamentState
  entryFee: number
  rakePercent: number
  scheduledAt: number
  openAt: number
  startAt: number
  createdAt: number
  lockedAt?: number
  finishedAt?: number
  settledAt?: number
  currentQuestionStart?: number
  currentQuestionIndex?: number
  questions: Question[]
  questionSetId: string
  players: PlayerTournament[]
  answers: Answer[]
  pot: Pot
  payouts: Payout[]
}

export interface QuestionSet {
  id: string
  title: string
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctOption: number
  timeoutSeconds?: number
}

export interface PlayerTournament {
  playerId: string
  joinedAt: number
  contribution: number
}

export interface Answer {
  tournamentId: string
  questionId: string
  playerId: string
  optionIndex: number
  submittedAt: number
}

export interface Pot {
  gross: number
  rakePercent: number
  net: number
}

export interface Payout {
  playerId: string
  amount: number
  rank: number
  correct: number
  avgLatency: number
}

export interface JoinRequest {
  playerId: string
  contribution?: number
  walletAddress?: string
}

export interface TournamentSummary {
  id: string
  name: string
  state: TournamentState
  startAt: number
  pot: Pot
  questionCount: number
}

export interface JoinCallbackPayload {
  playerId: string
  tournamentId: string
  paymentReference: string
  confirmedAt: number
}
