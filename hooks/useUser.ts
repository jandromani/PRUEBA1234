import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

const MAX_RETRIES = 2

interface IUser {
  id: string
  username: string
  isAdmin: boolean
  pollsCreated: number
  pollsParticipated: number
  worldID: string
  worldProfilePic?: string
  name?: string
  email: string
  createdAt: string
  updatedAt: string
}

interface IUserActivity {
  id: string
  userId: string
  activityType: string
  timestamp: string
}

interface ISetVoteParams {
  pollId: number
  weightDistribution: Record<string, number>
}

interface IEditVoteParams {
  voteID: string
  weightDistribution: Record<string, number>
}

interface IGetUserVotesResponse {
  voteID: string
  options: string[]
  votingPower: number
  weightDistribution: Record<string, number>
}

export const useUserData = (
  worldId?: string | null,
): UseQueryResult<IUser, Error> => {
  const { worldID: authWorldId } = useAuth()
  const effectiveWorldId = worldId || authWorldId

  return useQuery({
    queryKey: ['user', 'data', effectiveWorldId],
    queryFn: async () => {
      try {
        const res = await fetch(`/user/getUserData?worldID=${effectiveWorldId}`)
        if (!res.ok) throw new Error('Failed to fetch user data')
        return await res.json()
      } catch (error) {
        console.error('Error fetching user data:', error)
        throw error
      }
    },
    enabled: !!effectiveWorldId,
  })
}

export const useUserActivities = ({
  filter,
  search,
}: {
  filter: 'active' | 'inactive' | 'created' | 'participated'
  search: string
}): UseQueryResult<{
  activities: IUserActivity[]
  total: number
}> => {
  const { worldID } = useAuth()

  return useQuery({
    queryKey: ['user', 'activities', filter, search, worldID],
    queryFn: async () => {
      const urlParams = new URLSearchParams({ filter, search })

      const res = await fetch(`/user/getUserActivities?${urlParams.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch user activities')
      return res.json()
    },
  })
}

export const useGetUserVotes = (
  pollId: number,
): UseQueryResult<IGetUserVotesResponse> => {
  const { worldID } = useAuth()

  return useQuery({
    queryKey: ['user', 'votes', pollId, worldID],
    queryFn: async () => {
      const urlParams = new URLSearchParams({
        pollId: String(pollId),
      })

      const res = await fetch(`/user/getUserVotes?${urlParams.toString()}`)

      if (!res.ok) throw new Error('Failed to fetch user votes')

      return res.json()
    },
    staleTime: 0,
    retry: failureCount => {
      if (failureCount >= MAX_RETRIES) return false

      return true
    },
  })
}

export const useSetVote = () => {
  const queryClient = useQueryClient()
  const { worldID } = useAuth()

  return useMutation({
    mutationFn: async (params: ISetVoteParams) => {
      const res = await fetch('/user/setVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) throw new Error('Failed to set vote')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'votes', variables.pollId, worldID],
      })
    },
  })
}

export const useEditVote = () => {
  const queryClient = useQueryClient()
  const { worldID } = useAuth()

  return useMutation({
    mutationFn: async (params: IEditVoteParams) => {
      const res = await fetch('/user/editVote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) throw new Error('Failed to edit vote')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user', 'votes', variables.voteID, worldID],
      })
    },
  })
}
