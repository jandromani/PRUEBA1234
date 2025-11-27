import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query'
import { IPoll, IPollDetails, PollSortBy } from '@/types/poll'

export const POLLS_LIMIT = 10

interface IUsePollParams {
  page?: number
  limit?: number
  isActive?: boolean | 'none'
  userVoted?: boolean
  userCreated?: boolean
  sortBy?: PollSortBy
  sortOrder?: 'asc' | 'desc'
  search?: string
}

interface ICreatePollData {
  title: string
  description: string
  options: string[]
  startDate: string
  endDate: string
  tags: string[]
  isAnonymous?: boolean
}

interface IDraftPollData {
  title?: string
  description?: string
  options?: string[]
  tags?: string[]
  isAnonymous?: boolean
  pollId?: number
  startDate?: string
  endDate?: string
}

export const useGetPolls = (
  filters: IUsePollParams = {},
): UseQueryResult<{
  polls: IPoll[]
  total: number
}> => {
  return useQuery({
    queryKey: ['polls', filters],
    queryFn: async () => {
      if (filters.isActive === 'none') {
        return {
          polls: [],
          total: 0,
        }
      }

      const params: IUsePollParams = {
        page: filters.page || 1,
        limit: filters.limit || POLLS_LIMIT,
        isActive: filters.isActive ?? undefined,
        userVoted: filters.userVoted ?? undefined,
        userCreated: filters.userCreated ?? undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder || 'desc',
        search: filters.search || undefined,
      }

      const paramsString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')

      const res = await fetch(`/poll?${paramsString}`)
      if (!res.ok) throw new Error('Failed to fetch polls')

      return res.json()
    },
  })
}

export const useGetPollDetails = (id: number): UseQueryResult<IPollDetails> => {
  return useQuery({
    queryKey: ['poll', id],
    queryFn: async () => {
      const res = await fetch(`/poll/${id}`)
      if (!res.ok) throw new Error('Failed to fetch poll details')
      return res.json()
    },
    enabled: !!id,
  })
}

export const useCreatePoll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ICreatePollData): Promise<IPoll> => {
      const res = await fetch('/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create poll')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
    retry: false,
  })
}

export const useDeletePoll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await fetch(`/poll/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete poll')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export const useGetDraftPoll = () => {
  return useQuery({
    queryKey: ['draftPoll'],
    queryFn: async () => {
      const res = await fetch('/poll/draft', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status === 404) {
        return null // No draft poll exists
      }

      if (!res.ok) throw new Error('Failed to fetch draft poll')

      return await res.json()
    },
    staleTime: 1 * 60 * 1000, // Don't refetch for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount
    retry: 1, // Only retry once on failure
  })
}

export const useCreateOrUpdateDraftPoll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IDraftPollData): Promise<IDraftPollData> => {
      const res = await fetch('/poll/draft', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save draft poll')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draftPoll'] })
    },
  })
}
