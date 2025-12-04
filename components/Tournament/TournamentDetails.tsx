'use client'

import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import { useTournamentDetails } from '@/hooks/useTournament'

export default function TournamentDetails() {
  const { id } = useParams()
  const tournamentId = Array.isArray(id) ? Number(id[0]) : Number(id)
  const { data, isLoading, error } = useTournamentDetails(tournamentId)

  if (!tournamentId) {
    return <p className="p-5">Tournament not found.</p>
  }

  if (isLoading) {
    return <p className="p-5">Loading tournament...</p>
  }

  if (error || !data) {
    return <p className="p-5 text-red-500">Unable to load tournament details.</p>
  }

  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header title={data.title} backUrl="/tournaments" />
      <section className="space-y-6">
        <motion.div
          className="p-4 bg-gray-100 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-600">Lobby code</p>
          <p className="text-2xl font-bold text-gray-900">{data.lobbyCode}</p>
          <p className="text-sm text-gray-500 mt-2">Pot: {data.pot} credits</p>
          <p className="text-sm text-gray-500">Entrants: {data.entrants}</p>
        </motion.div>

        {data.currentQuestion && (
          <motion.div
            className="p-4 border border-gray-100 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">Current question</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">
              {data.currentQuestion.prompt}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {data.currentQuestion.options.map(option => (
                <span key={option} className="px-3 py-2 rounded-lg bg-gray-50 text-gray-800">
                  {option}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Closes at {new Date(data.currentQuestion.closesAt).toLocaleTimeString()}
            </p>
          </motion.div>
        )}

        <motion.div
          className="p-4 border border-gray-100 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Scoreboard</h3>
            <span className="text-sm text-gray-500">Top players</span>
          </div>
          <div className="space-y-3">
            {data.scoreboard.map(entry => (
              <div
                key={entry.playerId}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        {entry.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{entry.name}</p>
                    <p className="text-xs text-gray-500">Player #{entry.playerId}</p>
                  </div>
                </div>
                <p className="text-primary font-semibold">{entry.score} pts</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="p-4 border border-gray-100 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900">Prize pool</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{data.prizePoolBreakdown}</p>
        </motion.div>
      </section>
    </main>
  )
}
