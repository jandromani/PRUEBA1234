import { TournamentAction, TournamentSummary } from '@/types/tournament'

// Transform an activity into a tournament card-friendly structure
export const transformActionToTournament = (
  action: TournamentAction,
): TournamentSummary => {
  return {
    id: action.tournamentId,
    title: action.tournamentTitle,
    host: 'Match history',
    status: action.action === 'won' ? 'finished' : 'live',
    entrants: 0,
    pot: action.potChange ?? 0,
    startDate: action.at,
    currentQuestion: undefined,
  }
}
