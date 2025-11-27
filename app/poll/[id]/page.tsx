'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import PollVoteCard from '@/components/Poll/PollVoteCard'

export default function PollPage() {
  const { id } = useParams()
  const idParam = id && Array.isArray(id) ? id[0] : id
  const pollId = Number(idParam)

  if (!pollId) {
    return <div>Poll not found</div>
  }

  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header />
      <PollVoteCard pollId={pollId} />
    </main>
  )
}
