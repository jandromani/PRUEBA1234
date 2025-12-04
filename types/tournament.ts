<<<<<<< HEAD
export interface TournamentSummary {
  id: number
  title: string
  host: string
  status: 'lobby' | 'live' | 'finished'
  entrants: number
  pot: number
  currentQuestion?: TournamentQuestion
  startDate: string
  endDate?: string
}

export interface TournamentQuestion {
  id: number
  prompt: string
  options: string[]
  closesAt: string
}

export interface TournamentScoreboardEntry {
  playerId: number
  name: string
  score: number
  avatar?: string
}

export interface TournamentDetails extends TournamentSummary {
  lobbyCode: string
  scoreboard: TournamentScoreboardEntry[]
  prizePoolBreakdown: string
}

export interface TournamentAction {
  id: number
  tournamentId: number
  tournamentTitle: string
  action: 'joined' | 'played' | 'won'
  at: string
  scoreImpact: number
  potChange?: number
=======
export interface TournamentQuestion {
  id: string
  prompt: string
  deadline: string
  openedAt: string
}

export interface TournamentEvent {
  type: 'question' | 'closed' | 'heartbeat'
  question?: TournamentQuestion
  reason?: string
}

export interface ResponsePayload {
  questionId: string
  participantId: string
  answer: string
  nonce?: string
  clientTimestamp?: string
}

export interface TournamentResponse {
  id: string
  questionId: string
  participantId: string
  answer: string
  nonce: string
  clientTimestamp?: string
  receivedAt: string
  latencyMs: number
  suspiciousLatency: boolean
  hash: string
}

export type FraudReason =
  | 'duplicate_submission'
  | 'outside_window'
  | 'unknown_question'
  | 'suspicious_latency'

export interface FraudFlag {
  id: string
  participantId?: string
  questionId?: string
  createdAt: string
  severity: 'warning' | 'blocked'
  reason: FraudReason
  details?: string
}

export interface TournamentRoomStatus {
  closed: boolean
  currentQuestion?: TournamentQuestion
>>>>>>> master
}
