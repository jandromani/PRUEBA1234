import { useQuery, UseQueryResult } from '@tanstack/react-query'

interface PollVoterResponse {
  pollId: number
  pollTitle: string
  votes: {
    username: string
    quadraticWeights: Record<string, number>
    totalQuadraticWeights: number
  }[]
}

/**
 * Custom hook to fetch voters data for a specific poll
 * @param pollId - The ID of the poll to fetch votes for
 */
export const usePollVotes = (
  pollId?: string | number,
): UseQueryResult<PollVoterResponse> => {
  return useQuery({
    queryKey: ['poll', pollId, 'votes'],
    queryFn: async () => {
      const res = await fetch(`/poll/${pollId}/votes`)
      if (!res.ok) {
        throw new Error('Failed to fetch voters data')
      }
      return res.json() as Promise<PollVoterResponse>
    },
    enabled: !!pollId,
  })
}
