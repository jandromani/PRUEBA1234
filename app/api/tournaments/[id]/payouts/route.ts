import { NextRequest, NextResponse } from 'next/server'
import { mockPayouts } from '@/lib/tournament/mockData'
import { PayoutRecord } from '@/lib/tournament/types'

function reconcileStatuses(payouts: PayoutRecord[]): PayoutRecord[] {
  return payouts.map(payout => {
    if (payout.txHash && payout.status === 'pending') {
      return { ...payout, status: 'submitted' }
    }

    return payout
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<{ payouts: PayoutRecord[] }>> {
  const tournamentId = params.id
  const payouts = mockPayouts
    .filter(payout => payout.tournamentId === tournamentId)
    .sort((a, b) => a.rank - b.rank)

  const reconciled = reconcileStatuses(payouts)

  return NextResponse.json({ payouts: reconciled })
}
