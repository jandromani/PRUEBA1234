export type TournamentPhase = 'locked' | 'settled'

export interface TournamentEntry {
  participantId: string
  prediction: number
  submittedAt: Date
}

export interface Tournament {
  id: string
  buyIn: number // entry price in native token units
  rakeBps: number // rake expressed in basis points
  entries: TournamentEntry[]
  status: TournamentPhase
}

export interface PotBreakdown {
  totalEntries: number
  grossPot: number
  rakeBps: number
  prizePool: number
}

export interface RankingRow {
  participantId: string
  correctCount: number
  averageLatencyMs: number
  position: number
}

export type PayoutStatus = 'pending' | 'submitted' | 'confirmed' | 'failed'

export interface PayoutRecord {
  id: string
  tournamentId: string
  participantId: string
  rank: number
  amount: number
  txHash?: string
  merkleProof?: string[]
  status: PayoutStatus
  explorerUrl?: string
}

export interface TournamentResults {
  answers: number[]
  submissionWindows: Record<string, number>
}
