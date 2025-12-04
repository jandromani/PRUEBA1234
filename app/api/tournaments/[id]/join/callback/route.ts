import { NextResponse } from 'next/server'
import { getTournamentService, parseJson } from '@/lib/tournaments/service'
import type { JoinCallbackPayload } from '@/lib/tournaments/types'

interface Params {
  params: { id: string }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const payload = await parseJson<JoinCallbackPayload>(request)
    const tournament = getTournamentService().handleJoinCallback(
      params.id,
      payload,
    )
    return NextResponse.json({
      tournamentId: tournament.id,
      state: tournament.state,
      players: tournament.players.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
