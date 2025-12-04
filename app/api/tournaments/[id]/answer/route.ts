import { NextResponse } from 'next/server'
import { getTournamentService, parseJson } from '@/lib/tournaments/service'

interface Params {
  params: { id: string }
}

interface AnswerPayload {
  playerId: string
  optionIndex: number
}

export async function POST(request: Request, { params }: Params) {
  try {
    const body = await parseJson<AnswerPayload>(request)
    const answer = getTournamentService().submitAnswer(
      params.id,
      body.playerId,
      body.optionIndex,
    )
    return NextResponse.json({ answer })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
