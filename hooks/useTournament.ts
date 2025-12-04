import { useQuery, UseQueryResult } from '@tanstack/react-query'
import {
  Question,
  TournamentState,
  TournamentSummary,
} from '@/lib/tournaments/types'

interface TournamentQuestionPayload {
  question: Pick<Question, 'id' | 'text' | 'options'>
  remainingMs: number
  index: number
}

export interface TournamentDetails extends TournamentSummary {
  currentState: TournamentState
  currentQuestionIndex: number | null
  currentQuestion?: TournamentQuestionPayload
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

export const useTournaments = (): UseQueryResult<TournamentSummary[]> => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const data = await fetchJson<{ tournaments: TournamentSummary[] }>(
        '/api/tournaments/active',
      )
      return data.tournaments
    },
  })
}

export const useTournamentDetails = (
  id?: string,
): UseQueryResult<TournamentDetails | undefined> => {
  return useQuery({
    queryKey: ['tournament', id, 'details'],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return undefined

      const [{ tournaments }, statePayload] = await Promise.all([
        fetchJson<{ tournaments: TournamentSummary[] }>('/api/tournaments/active'),
        fetchJson<{
          state: TournamentState
          currentQuestionIndex: number | null
        }>(`/api/tournaments/${id}/state`),
      ])

      const summary = tournaments.find(tournament => tournament.id === id)
      if (!summary) return undefined

      let currentQuestion: TournamentQuestionPayload | undefined
      try {
        const questionPayload = await fetchJson<TournamentQuestionPayload & { error?: string }>(
          `/api/tournaments/${id}/questions/current`,
        )
        if (!('error' in questionPayload)) {
          currentQuestion = questionPayload
        }
      } catch (_error) {
        currentQuestion = undefined
      }

      return {
        ...summary,
        currentState: statePayload.state,
        currentQuestionIndex: statePayload.currentQuestionIndex,
        currentQuestion,
      }
    },
  })
}
