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
}
