import { NextResponse } from 'next/server'
import { getTournamentRoom } from '@/lib/tournamentRoom'

export const runtime = 'nodejs'

export async function GET() {
  const room = getTournamentRoom()
  return NextResponse.json({ flags: room.getFraudFlags() })
}
