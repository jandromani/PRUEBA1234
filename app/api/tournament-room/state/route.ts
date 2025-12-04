import { NextRequest, NextResponse } from 'next/server'
import { getTournamentRoom } from '@/lib/tournamentRoom'

export const runtime = 'nodejs'

function validateDate(value: string) {
  const date = new Date(value)
  return !Number.isNaN(date.getTime())
}

export async function GET() {
  const room = getTournamentRoom()
  return NextResponse.json(room.getStatus())
}

export async function POST(req: NextRequest) {
  const room = getTournamentRoom()
  const body = await req.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { action, questionId, prompt, deadline, openedAt, reason } = body

  if (action === 'close') {
    room.close(reason)
    return NextResponse.json(room.getStatus())
  }

  if (!questionId || !prompt || !deadline) {
    return NextResponse.json(
      { error: 'questionId, prompt and deadline are required' },
      { status: 400 },
    )
  }

  if (!validateDate(deadline)) {
    return NextResponse.json(
      { error: 'deadline must be a valid date' },
      { status: 400 },
    )
  }

  if (openedAt && !validateDate(openedAt)) {
    return NextResponse.json(
      { error: 'openedAt must be a valid date when provided' },
      { status: 400 },
    )
  }

  room.setActiveQuestion({ id: questionId, prompt, deadline, openedAt })
  return NextResponse.json(room.getStatus())
}
