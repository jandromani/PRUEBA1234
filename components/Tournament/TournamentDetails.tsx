'use client'

import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import { useTournamentDetails } from '@/hooks/useTournament'

export default function TournamentDetails() {
  const { id } = useParams()
  const tournamentId = Array.isArray(id) ? id[0] : id
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
      <Header title={data.name} backUrl="/tournaments" />
      <section className="space-y-6">
        <motion.div
          className="p-4 bg-gray-100 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-600">Estado</p>
          <p className="text-2xl font-bold text-gray-900">{data.currentState}</p>
          <p className="text-sm text-gray-500 mt-2">Pot bruto: {data.pot.gross}</p>
          <p className="text-sm text-gray-500">Pot neto: {data.pot.net}</p>
        </motion.div>

        {data.currentQuestion && (
          <motion.div
            className="p-4 border border-gray-100 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">Current question</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">
              {data.currentQuestion.question.text}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {data.currentQuestion.question.options.map(option => (
                <span key={option} className="px-3 py-2 rounded-lg bg-gray-50 text-gray-800">
                  {option}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">Tiempo restante: {Math.round(data.currentQuestion.remainingMs / 1000)}s</p>
          </motion.div>
        )}

        <motion.div
          className="p-4 border border-gray-100 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900">Detalles del torneo</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Preguntas totales: {data.questionCount}. Estado actual: {data.currentState}.
            Último índice de pregunta: {data.currentQuestionIndex ?? 0}.
          </p>
        </motion.div>
      </section>
    </main>
  )
}
