'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { TournamentSummary } from '@/lib/tournaments/types'
import { ArrowLeft, ArrowRight } from '../icon-components'

interface TournamentCardProps {
  tournament: TournamentSummary
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColor = {
    scheduled: 'bg-blue-100 text-blue-700',
    open: 'bg-amber-100 text-amber-700',
    locked: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-emerald-100 text-emerald-700',
    finished: 'bg-gray-200 text-gray-600',
    settled: 'bg-gray-200 text-gray-600',
  }[tournament.state]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {tournament.state === 'open'
            ? 'Lobby abierta'
            : tournament.state === 'in_progress'
              ? 'En vivo'
              : tournament.state === 'scheduled'
                ? 'Programado'
                : 'Finalizado'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{tournament.name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(tournament.startAt).toLocaleString()}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
            <span className="bg-gray-100 px-3 py-1 rounded-full">Pot neto: {tournament.pot.net}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Preguntas: {tournament.questionCount}
            </span>
          </div>
        </div>
        <ArrowLeft className="rotate-180 text-gray-400" />
      </div>
      <Link
        href={`/tournaments/${tournament.id}`}
        className="flex items-center justify-between px-4 py-3 text-primary font-semibold border-t border-gray-100"
      >
        View lobby & scoreboard
        <ArrowRight className="text-primary" />
      </Link>
    </motion.article>
  )
}
