import { NextRequest, NextResponse } from 'next/server'

import {
  fetchTransactionFromGateway,
  getPot,
  reconcileTransaction,
  TransactionVerification,
} from '@/utils/tournamentPayments'

type Params = Promise<{ id: string }>

type CallbackPayload = {
  transactionId?: string
  worldId?: string
  walletAddress?: string
}

const parsePayload = async (request: NextRequest): Promise<CallbackPayload> => {
  try {
    return (await request.json()) as CallbackPayload
  } catch {
    return {}
  }
}

const validatePayload = (payload: CallbackPayload) => {
  if (!payload.transactionId) return 'Missing transactionId'
  if (!payload.worldId) return 'Missing World ID for the player'
  if (!payload.walletAddress) return 'Missing wallet address for the player'
  return null
}

const verifyTransactionWithGateway = async (
  transactionId: string,
  abortSignal?: AbortSignal,
): Promise<TransactionVerification> => {
  return fetchTransactionFromGateway(transactionId, abortSignal)
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { id: tournamentId } = await params
  const payload = await parsePayload(request)
  const validationError = validatePayload(payload)

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const verification = await verifyTransactionWithGateway(
      payload.transactionId!,
      request.signal,
    )

    if (verification.status === 'failed') {
      return NextResponse.json(
        { error: 'Payment failed on gateway, no changes applied' },
        { status: 400 },
      )
    }

    const join = reconcileTransaction(
      verification,
      tournamentId,
      payload.worldId!,
      payload.walletAddress!,
    )
    const pot = getPot(tournamentId)

    return NextResponse.json({
      status: join.joinStatus,
      transactionId: join.transactionId,
      transactionHash: join.transactionHash,
      pot: pot
        ? { total: pot.total, currency: pot.currency, tournamentId: pot.tournamentId }
        : null,
      audit: join.auditLog.slice(-3),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to validate the payment with World/MiniKit'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
