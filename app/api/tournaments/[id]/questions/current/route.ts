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

    const question = service.getCurrentQuestion(params.id)
    if (!question) {
      return NextResponse.json({ error: 'No active question' }, { status: 404 })
    }

    const now = Date.now()
    const start = tournament.currentQuestionStart ?? tournament.startAt
    const timeout =
      (question.timeoutSeconds ?? 14) * 1000 - Math.max(0, now - start)

    return NextResponse.json({
      question: {
        id: question.id,
        text: question.text,
        options: question.options,
      },
      remainingMs: Math.max(0, timeout),
      index: tournament.currentQuestionIndex ?? 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
