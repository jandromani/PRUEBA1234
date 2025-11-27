import Header from '@/components/Header'
import VotersList from '@/components/Voters/VotersList'

export default function VotersPage() {
  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header title="Voters" />
      <VotersList />
    </main>
  )
}
