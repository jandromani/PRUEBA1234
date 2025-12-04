import TournamentList from '@/components/Tournament/TournamentList'

export default function TournamentsPage() {
  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Play & compete</p>
          <h1 className="text-2xl font-semibold text-gray-900">Tournaments</h1>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary text-white text-sm font-semibold">Live</span>
      </div>
      <TournamentList />
    </main>
  )
}
