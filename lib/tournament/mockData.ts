import { PayoutRecord, RankingRow } from './types'

export const mockRanking: RankingRow[] = [
  {
    participantId: 'alice.world',
    correctCount: 8,
    averageLatencyMs: 1200,
    position: 1,
  },
  {
    participantId: 'bob.world',
    correctCount: 7,
    averageLatencyMs: 2200,
    position: 2,
  },
  {
    participantId: 'carol.world',
    correctCount: 7,
    averageLatencyMs: 3300,
    position: 3,
  },
]

export const mockPayouts: PayoutRecord[] = [
  {
    id: 'payout_1',
    tournamentId: 'demo-tournament',
    participantId: 'alice.world',
    rank: 1,
    amount: 500,
    txHash: '0xabc',
    explorerUrl: 'https://worldchain.explorer/tx/0xabc',
    status: 'submitted',
  },
  {
    id: 'payout_2',
    tournamentId: 'demo-tournament',
    participantId: 'bob.world',
    rank: 2,
    amount: 300,
    txHash: undefined,
    status: 'pending',
    explorerUrl: undefined,
  },
  {
    id: 'payout_3',
    tournamentId: 'demo-tournament',
    participantId: 'carol.world',
    rank: 3,
    amount: 200,
    txHash: '0xdef',
    explorerUrl: 'https://worldchain.explorer/tx/0xdef',
    status: 'confirmed',
  },
]
