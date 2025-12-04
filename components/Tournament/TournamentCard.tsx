'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { TournamentSummary } from '@/types/tournament'
import { ArrowLeft, ArrowRight } from '../icon-components'

interface TournamentCardProps {
  tournament: TournamentSummary
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const statusColor = {
    lobby: 'bg-amber-100 text-amber-700',
    live: 'bg-emerald-100 text-emerald-700',
    finished: 'bg-gray-200 text-gray-600',
  }[tournament.status]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {tournament.status === 'lobby'
            ? 'Lobby Open'
            : tournament.status === 'live'
              ? 'Live'
              : 'Finished'}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{tournament.title}</h3>
          <p className="text-sm text-gray-500">Hosted by {tournament.host}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-700">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Entrants: {tournament.entrants}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">Pot: {tournament.pot} credits</span>
          </div>
          {tournament.currentQuestion && (
            <p className="mt-3 text-sm text-gray-700">
              Current question: <strong>{tournament.currentQuestion.prompt}</strong>
            </p>
          )}
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
