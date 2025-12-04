import { TournamentSummary } from '@/lib/tournaments/types'
import { TournamentAction } from '@/types/tournament'

// Transform an activity into a tournament card-friendly structure
export const transformActionToTournament = (
  action: TournamentAction,
): TournamentSummary => {
  return {
    id: action.tournamentId,
    name: action.tournamentTitle,
    state: action.action === 'won' ? 'finished' : 'in_progress',
    pot: { gross: action.potChange ?? 0, net: action.potChange ?? 0, rakePercent: 0 },
    startAt: new Date(action.at).getTime(),
    questionCount: 0,
  }
}
