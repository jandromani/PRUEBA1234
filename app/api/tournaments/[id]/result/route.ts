import { NextResponse } from 'next/server'
import { getTournamentService } from '@/lib/tournaments/service'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const payouts = getTournamentService().getResult(params.id)
    return NextResponse.json({ payouts })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
