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
}
