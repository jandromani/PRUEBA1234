import crypto from 'crypto'
import {
  explorerLink,
  idempotentId,
  TournamentEnv,
  TournamentRepository,
} from './d1'
import {
  PotBreakdown,
  PayoutRecord,
  RankingRow,
  TournamentResults,
  TournamentEntry,
} from './types'

export function calculatePot(
  totalEntries: number,
  buyIn: number,
  rakeBps: number,
): PotBreakdown {
  const grossPot = totalEntries * buyIn
  const rake = Math.floor((grossPot * rakeBps) / 10_000)
  const prizePool = grossPot - rake

  return {
    totalEntries,
    grossPot,
    rakeBps,
    prizePool,
  }
}

export function evaluateRanking(
  entries: TournamentEntry[],
  results: TournamentResults,
): RankingRow[] {
  const withScores = entries.map(entry => {
    const correctCount = results.answers.filter(
      answer => answer === entry.prediction,
    ).length
    const latencyBudget = results.submissionWindows[entry.participantId] ?? 0
    const averageLatencyMs = Math.max(
      0,
      latencyBudget - entry.submittedAt.getTime(),
    )

    return { entry, correctCount, averageLatencyMs }
  })

  const ordered = withScores
    .sort((a, b) => {
      if (b.correctCount !== a.correctCount)
        return b.correctCount - a.correctCount
      return a.averageLatencyMs - b.averageLatencyMs
    })
    .map((row, index) => ({
      participantId: row.entry.participantId,
      correctCount: row.correctCount,
      averageLatencyMs: row.averageLatencyMs,
      position: index + 1,
    }))

  return ordered
}

export function allocatePrize(
  prizePool: number,
  ranking: RankingRow[],
): PayoutRecord[] {
  const splits = [0.5, 0.3, 0.2]
  const payouts: PayoutRecord[] = []

  ranking.forEach(row => {
    const weight = splits[row.position - 1] ?? 0
    const amount = Math.round(prizePool * weight)

    if (amount > 0) {
      payouts.push({
        id: idempotentId('payout'),
        tournamentId: '',
        participantId: row.participantId,
        rank: row.position,
        amount,
        status: 'pending',
      })
    }
  })

  return payouts
}

export async function submitCustodialTransfers(
  env: TournamentEnv,
  payouts: PayoutRecord[],
  transfer: (payout: PayoutRecord) => Promise<string>,
): Promise<PayoutRecord[]> {
  const submitted: PayoutRecord[] = []

  for (const payout of payouts) {
    try {
      const txHash = await transfer(payout)
      submitted.push({
        ...payout,
        txHash,
        status: 'submitted',
        explorerUrl: explorerLink(env, txHash),
      })
    } catch (error) {
      submitted.push({ ...payout, status: 'failed' })
      console.error('Failed to transfer payout', error)
    }
  }

  return submitted
}

export function merkleRootFromRanking(ranking: RankingRow[]): string {
  const leaves = ranking.map(row =>
    crypto
      .createHash('sha256')
      .update(
        `${row.participantId}:${row.correctCount}:${row.averageLatencyMs}`,
      )
      .digest('hex'),
  )

  if (leaves.length === 0) return ''

  let layer = leaves
  while (layer.length > 1) {
    const next: string[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right = layer[i + 1] ?? left
      const combined = crypto
        .createHash('sha256')
        .update(left + right)
        .digest('hex')
      next.push(combined)
    }
    layer = next
  }

  return layer[0]
}

export interface SettlementInputs {
  tournamentId: string
  results: TournamentResults
  buyIn: number
  rakeBps: number
}

export class SettlementWorker {
  constructor(
    private readonly repo: TournamentRepository,
    private readonly env: TournamentEnv,
  ) {}

  async lockPotAndPersist(
    tournamentId: string,
    buyIn: number,
    rakeBps: number,
    entries: TournamentEntry[],
  ): Promise<PotBreakdown> {
    const pot = calculatePot(entries.length, buyIn, rakeBps)
    await this.repo.persistPot(tournamentId, pot)
    return pot
  }

  async settle(
    inputs: SettlementInputs,
    transfer: (payout: PayoutRecord) => Promise<string>,
  ): Promise<{
    ranking: RankingRow[]
    payouts: PayoutRecord[]
    merkleRoot: string
  }> {
    const tournament = await this.repo.loadTournament(inputs.tournamentId)
    if (!tournament) throw new Error('Tournament not found')

    const pot = calculatePot(
      tournament.entries.length,
      inputs.buyIn,
      inputs.rakeBps,
    )
    await this.repo.persistPot(inputs.tournamentId, pot)

    const ranking = evaluateRanking(tournament.entries, inputs.results)
    await this.repo.saveRanking(inputs.tournamentId, ranking)

    const payouts = allocatePrize(pot.prizePool, ranking).map(payout => ({
      ...payout,
      tournamentId: inputs.tournamentId,
    }))

    const submitted = await submitCustodialTransfers(
      this.env,
      payouts,
      transfer,
    )
    await this.repo.createPayouts(submitted)

    const merkleRoot = merkleRootFromRanking(ranking)

    return { ranking, payouts: submitted, merkleRoot }
  }
}
