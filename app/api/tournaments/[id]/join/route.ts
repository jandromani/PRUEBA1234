import { NextRequest, NextResponse } from 'next/server'

import { Currency, setPendingJoin } from '@/utils/tournamentPayments'

type Params = Promise<{ id: string }>

type JoinPayload = {
  worldId?: string
  walletAddress?: string
  amount?: number
  currency?: Currency
}

const parsePayload = async (request: NextRequest): Promise<JoinPayload> => {
  try {
    return (await request.json()) as JoinPayload
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const { id: tournamentId } = await params
  const { worldId, walletAddress, amount, currency = 'WLD' } = await parsePayload(request)

  if (!worldId || !walletAddress) {
    return NextResponse.json(
      { error: 'Missing World ID or wallet address for the player' },
      { status: 400 },
    )
  }

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: 'A positive amount is required to join the tournament' },
      { status: 400 },
    )
  }

  if (!['WLD', 'USDC'].includes(currency)) {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
  }

  const destination = process.env.PAYMENT_DESTINATION

  if (!destination) {
    return NextResponse.json(
      { error: 'Payment destination is not configured on the server' },
      { status: 500 },
    )
  }

  try {
    const join = setPendingJoin(tournamentId, worldId, walletAddress, amount, currency, destination)

    return NextResponse.json({
      destination,
      amount: join.amount,
      currency: join.currency,
      status: join.joinStatus,
      message: 'Payment intent created, proceed with MiniKit.commandsAsync.pay',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create payment intent'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
