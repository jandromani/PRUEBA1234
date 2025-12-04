import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { TournamentAction } from '@/types/tournament'

interface UserActivitiesResponseDto {
  actions: TournamentAction[]
}

interface UseUserActivitiesParams {
  worldID: string
  search?: string
}

const mockActions: TournamentAction[] = [
  {
    id: 1,
    tournamentId: '12',
    tournamentTitle: 'Realm Clash Invitational',
    action: 'joined',
    at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    scoreImpact: 12,
    potChange: 120,
  },
  {
    id: 2,
    tournamentId: '12',
    tournamentTitle: 'Realm Clash Invitational',
    action: 'played',
    at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    scoreImpact: 6,
  },
  {
    id: 3,
    tournamentId: '21',
    tournamentTitle: 'Guild Trials Qualifier',
    action: 'won',
    at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    scoreImpact: 18,
    potChange: 420,
  },
]

export const useUserActivities = (
  params: UseUserActivitiesParams,
): UseQueryResult<UserActivitiesResponseDto> => {
  const { search } = params

  return useQuery({
    queryKey: ['userActivities', params],
    queryFn: async () => {
      if (!search) {
        return { actions: mockActions }
      }

      const filteredActions = mockActions.filter(action =>
        action.tournamentTitle.toLowerCase().includes(search.toLowerCase()),
      )

      return { actions: filteredActions }
    },
    enabled: !!params.worldID,
  })
}
