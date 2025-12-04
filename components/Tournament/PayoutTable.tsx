'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { PayoutRecord } from '@/lib/tournament/types'

interface Props {
  payouts: PayoutRecord[]
}

const statusColors: Record<PayoutRecord['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

export function PayoutTable({ payouts }: Props) {
  const rows = useMemo(
    () => [...payouts].sort((a, b) => a.rank - b.rank),
    [payouts],
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Participant
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tx Hash
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map(payout => (
            <tr key={payout.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                #{payout.rank}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                {payout.participantId}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                {payout.amount}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-blue-600">
                {payout.txHash ? (
                  <Link
                    href={payout.explorerUrl || '#'}
                    className="underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {payout.txHash}
                  </Link>
                ) : (
                  <span className="text-gray-400">Pending</span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[payout.status]}`}
                >
                  {payout.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
