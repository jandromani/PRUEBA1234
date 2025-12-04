import crypto from 'crypto'
import {
  PotBreakdown,
  PayoutRecord,
  RankingRow,
  Tournament,
  TournamentEntry,
} from './types'

// Minimal D1 types to avoid adding dependencies
interface D1PreparedStatement {
  bind(...values: (string | number)[]): D1PreparedStatement
  first<T = unknown>(): Promise<T | null>
  all<T = unknown>(): Promise<{ results: T[] }>
  run<T = unknown>(): Promise<T>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
}

export interface TournamentEnv {
  DB: D1Database
  explorerBaseUrl?: string
}

export class TournamentRepository {
  constructor(private readonly env: TournamentEnv) {}

  async loadTournament(tournamentId: string): Promise<Tournament | null> {
    const row = await this.env.DB.prepare(
      'SELECT id, buy_in as buyIn, rake_bps as rakeBps, status FROM tournaments WHERE id = ?',
    )
      .bind(tournamentId)
      .first<Tournament>()

    if (!row) return null

    const entries = await this.env.DB.prepare(
      'SELECT participant_id as participantId, prediction, submitted_at as submittedAt FROM tournament_entries WHERE tournament_id = ?',
    )
      .bind(tournamentId)
      .all<TournamentEntry>()

    return {
      ...row,
      entries: entries.results.map(entry => ({
        ...entry,
        submittedAt: new Date(entry.submittedAt),
      })),
    }
  }

  async persistPot(tournamentId: string, pot: PotBreakdown): Promise<void> {
    await this.env.DB.prepare(
      `INSERT OR REPLACE INTO pots (tournament_id, total_entries, gross_pot, rake_bps, prize_pool, created_at)
         VALUES (?, ?, ?, ?, ?, unixepoch())`,
    )
      .bind(
        tournamentId,
        pot.totalEntries,
        pot.grossPot,
        pot.rakeBps,
        pot.prizePool,
      )
      .run()
  }

  async saveRanking(
    tournamentId: string,
    ranking: RankingRow[],
  ): Promise<void> {
    const insert = this.env.DB.prepare(
      `INSERT INTO rankings (tournament_id, participant_id, position, correct_count, avg_latency_ms)
       VALUES (?, ?, ?, ?, ?)`,
    )

    for (const row of ranking) {
      await insert
        .bind(
          tournamentId,
          row.participantId,
          row.position,
          row.correctCount,
          row.averageLatencyMs,
        )
        .run()
    }
  }

  async createPayouts(payouts: PayoutRecord[]): Promise<void> {
    const insert = this.env.DB.prepare(
      `INSERT INTO payouts (id, tournament_id, participant_id, rank, amount, tx_hash, status, explorer_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )

    for (const payout of payouts) {
      await insert
        .bind(
          payout.id,
          payout.tournamentId,
          payout.participantId,
          payout.rank,
          payout.amount,
          payout.txHash ?? null,
          payout.status,
          payout.explorerUrl ?? null,
        )
        .run()
    }
  }

  async listPayouts(tournamentId: string): Promise<PayoutRecord[]> {
    const { results } = await this.env.DB.prepare(
      'SELECT id, participant_id as participantId, rank, amount, tx_hash as txHash, status, explorer_url as explorerUrl FROM payouts WHERE tournament_id = ? ORDER BY rank ASC',
    )
      .bind(tournamentId)
      .all<PayoutRecord>()

    return results
  }

  async markPayoutStatus(
    id: string,
    status: PayoutRecord['status'],
    txHash?: string,
  ): Promise<void> {
    await this.env.DB.prepare(
      'UPDATE payouts SET status = ?, tx_hash = COALESCE(tx_hash, ?) WHERE id = ?',
    )
      .bind(status, txHash ?? null, id)
      .run()
  }
}

export function explorerLink(
  env: TournamentEnv,
  txHash?: string,
): string | undefined {
  if (!txHash) return undefined
  const base = env.explorerBaseUrl ?? 'https://worldchain.explorer/tx/'
  return `${base}${txHash}`
}

export function idempotentId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}
