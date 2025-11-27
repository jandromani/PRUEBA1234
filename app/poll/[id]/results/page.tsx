'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import PollResultsCard from '@/components/Poll/PollResultsCard'
import { FilterParams } from '@/types/poll'

export default function PollPage() {
  const [backUrl, setBackUrl] = useState<string>()
  const { id } = useParams()
  const idParam = id && Array.isArray(id) ? id[0] : id
  const pollId = Number(idParam)

  useEffect(() => {
    const cameFromCreate = sessionStorage.getItem('worldview-came-from-create')
    if (cameFromCreate === 'true') {
      // User came from poll create, redirect to all polls
      setBackUrl(`/polls?filter=${FilterParams.All}`)
    }
    sessionStorage.removeItem('worldview-came-from-create')
    return () => {
      sessionStorage.removeItem('worldview-came-from-create')
    }
  }, [])

  if (!pollId) {
    return <div>Poll not found</div>
  }

  return (
    <main className="flex-1 bg-white rounded-t-3xl p-5">
      <Header backUrl={backUrl} />
      <PollResultsCard pollId={pollId} />
    </main>
  )
}
