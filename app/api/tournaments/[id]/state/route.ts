import { NextResponse } from 'next/server'
import { getTournamentService } from '@/lib/tournaments/service'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const service = getTournamentService()
    const tournament = service.getTournament(params.id)
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 },
      )
    }
    const state = tournament.state
    const currentQuestionIndex = tournament.currentQuestionIndex ?? null
    return NextResponse.json({ state, currentQuestionIndex })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
