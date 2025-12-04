import { useQuery, UseQueryResult } from '@tanstack/react-query'
import {
  TournamentDetails,
  TournamentQuestion,
  TournamentScoreboardEntry,
  TournamentSummary,
} from '@/types/tournament'

const mockQuestions: TournamentQuestion[] = [
  {
    id: 1,
    prompt: 'Which guild will claim the next relic?',
    options: ['Dragons', 'Wolves', 'Falcons', 'Titans'],
    closesAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    prompt: 'Predict the winning score for the finals.',
    options: ['< 60', '60 - 80', '80 - 95', '95+'],
    closesAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
  },
]

const mockScoreboard: TournamentScoreboardEntry[] = [
  { playerId: 1, name: 'Aria', score: 42, avatar: '/avatars/aria.png' },
  { playerId: 2, name: 'Rex', score: 36, avatar: '/avatars/rex.png' },
  { playerId: 3, name: 'Nova', score: 28 },
  { playerId: 4, name: 'Lumen', score: 21 },
]

const mockTournaments: TournamentDetails[] = [
  {
    id: 12,
    title: 'Realm Clash Invitational',
    host: 'WorldView League',
    status: 'live',
    entrants: 148,
    pot: 3200,
    currentQuestion: mockQuestions[0],
    startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    lobbyCode: 'CLASH-12',
    scoreboard: mockScoreboard,
    prizePoolBreakdown: 'Top 3 split 60/30/10 of the current pot.',
  },
  {
    id: 21,
    title: 'Guild Trials Qualifier',
    host: 'Guild Masters',
    status: 'lobby',
    entrants: 64,
    pot: 950,
    currentQuestion: mockQuestions[1],
    startDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    lobbyCode: 'TRIALS-21',
    scoreboard: mockScoreboard.map(entry => ({
      ...entry,
      score: Math.max(10, entry.score - 10),
    })),
    prizePoolBreakdown: 'Winner takes 70%, runner-up 20%, third place 10%.',
  },
]

export const useTournaments = (): UseQueryResult<TournamentSummary[]> => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () =>
      mockTournaments.map(({ scoreboard: _scoreboard, prizePoolBreakdown, ...summary }) => summary),
  })
}

export const useTournamentDetails = (
  id: number,
): UseQueryResult<TournamentDetails | undefined> => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => mockTournaments.find(tournament => tournament.id === id),
    enabled: !!id,
  })
}
