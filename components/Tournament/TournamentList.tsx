'use client'

import { motion } from 'framer-motion'
import TournamentCard from './TournamentCard'
import { useTournaments } from '@/hooks/useTournament'

export default function TournamentList() {
  const { data, isLoading, error } = useTournaments()

  if (isLoading) {
    return <p className="text-gray-500">Loading tournaments...</p>
  }

  if (error) {
    return <p className="text-red-500">Unable to load tournaments.</p>
  }

  if (!data || data.length === 0) {
    return <p className="text-gray-500">No tournaments available yet.</p>
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {data.map(tournament => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </motion.div>
  )
}
