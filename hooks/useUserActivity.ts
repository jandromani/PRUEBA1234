import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { UserActionDto } from '@/types/poll'

interface UserActivitiesResponseDto {
  userActions: UserActionDto[]
}

interface UseUserActivitiesParams {
  worldID: string
  isActive?: boolean
  isInactive?: boolean
  isCreated?: boolean
  isParticipated?: boolean
  search?: string
}

export const useUserActivities = (
  params: UseUserActivitiesParams,
): UseQueryResult<UserActivitiesResponseDto> => {
  const { worldID, ...restParams } = params

  return useQuery({
    queryKey: ['userActivities', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams()

      queryParams.append('worldID', worldID)

      Object.entries(restParams).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })

      const res = await fetch(
        `/user/getUserActivities?${queryParams.toString()}`,
      )

      if (!res.ok) {
        throw new Error('Failed to fetch user activities')
      }

      return res.json()
    },
    enabled: !!worldID,
  })
}
