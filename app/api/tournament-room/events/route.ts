import { NextRequest } from 'next/server'
import { getTournamentRoom } from '@/lib/tournamentRoom'

export const runtime = 'nodejs'

const encoder = new TextEncoder()

function formatEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export async function GET(_req: NextRequest) {
  const room = getTournamentRoom()

  let cleanup: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (eventName: string, payload: unknown) => {
        controller.enqueue(encoder.encode(formatEvent(eventName, payload)))
      }

      const unsubscribe = room.subscribe(event => {
        sendEvent(event.type, event)
      })

      // Immediately deliver current state for late subscribers
      const status = room.getStatus()
      if (status.currentQuestion) {
        sendEvent('question', {
          type: 'question',
          question: status.currentQuestion,
        })
      }
      if (status.closed && !status.currentQuestion) {
        sendEvent('closed', {
          type: 'closed',
          reason: 'tournament_room_closed',
        })
      }

      const heartbeat = setInterval(() => {
        sendEvent('heartbeat', {
          type: 'heartbeat',
          at: new Date().toISOString(),
        })
      }, 15000)

      cleanup = () => {
        clearInterval(heartbeat)
        unsubscribe()
      }
    },
    cancel() {
      if (cleanup) {
        cleanup()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
