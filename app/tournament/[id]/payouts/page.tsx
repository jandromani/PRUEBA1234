import { PayoutTable } from '@/components/Tournament/PayoutTable'
import { mockRanking } from '@/lib/tournament/mockData'
import { PayoutRecord } from '@/lib/tournament/types'

async function fetchPayouts(tournamentId: string): Promise<PayoutRecord[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/tournaments/${tournamentId}/payouts`,
    {
      cache: 'no-store',
    },
  )

  if (!res.ok) {
    console.error('Failed to fetch payouts for tournament', tournamentId)
    return []
  }

  const data = (await res.json()) as { payouts: PayoutRecord[] }
  return data.payouts
}

export default async function TournamentPayoutPage({
  params,
}: {
  params: { id: string }
}) {
  const payouts = await fetchPayouts(params.id)

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tournament payouts</h1>
        <p className="text-sm text-gray-500">
          Hashes de pago y enlaces al explorador para reconciliar el estado
          on-chain y custodial.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900">Ranking</h2>
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <ol className="space-y-2 text-sm text-gray-800">
            {mockRanking.map(row => (
              <li
                key={row.participantId}
                className="flex items-center justify-between"
              >
                <span>
                  #{row.position} · {row.participantId}
                </span>
                <span className="text-gray-500">
                  Aciertos: {row.correctCount}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900">Pagos y hashes</h2>
        <PayoutTable payouts={payouts} />
      </section>
    </div>
  )
}
