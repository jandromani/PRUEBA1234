import { NextResponse } from 'next/server'
import { getTournamentService } from '@/lib/tournaments/service'

export async function GET() {
  const tournaments = getTournamentService().getActiveTournaments()
  return NextResponse.json({ tournaments })
}
