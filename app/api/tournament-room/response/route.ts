import { NextRequest, NextResponse } from 'next/server'
import { getTournamentRoom } from '@/lib/tournamentRoom'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const room = getTournamentRoom()
  const body = await req.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { questionId, participantId, answer, nonce, clientTimestamp } = body

  if (!questionId || !participantId || !answer) {
    return NextResponse.json(
      { error: 'questionId, participantId and answer are required' },
      { status: 400 },
    )
  }

  try {
    const response = room.submitResponse({
      questionId,
      participantId,
      answer,
      nonce,
      clientTimestamp,
    })
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
