'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChevronDownIcon from '@/components/icon-components/ChevronDownIcon'
import InfoIcon from '@/components/icon-components/InfoIcon'
import UserIcon from '@/components/icon-components/UserIcon'
import { usePollVotes } from '@/hooks/usePollVotes'
import { useShare } from '@/hooks/useShare'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { ShareIcon } from '../icon-components'
import CustomShareModal from '../Modals/CustomShareModal'
import QuadraticInfoModal from '../Modals/QuadraticInfoModal'
import { Button } from '../ui/Button'

interface Voter {
  id: string
  username: string
  votes: {
    option: string
    count: number
  }[]
}

export default function VotersList() {
  const params = useParams()
  // Convert params.id which could be string or string[] to a single string or undefined
  const pollId = params.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined

  const [expandedVoter, setExpandedVoter] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [voters, setVoters] = useState<Voter[]>([])

  const { data: votersData, isLoading, error } = usePollVotes(pollId)

  const { handleSharePoll, isOpen, setIsOpen, shareUrl } = useShare()

  const pollTitle = votersData?.pollTitle

  useEffect(() => {
    if (votersData && votersData.votes) {
      // Transform the API response to match our component's expected format
      const transformedVoters = votersData.votes.map((vote, index) => {
        // Convert the quadraticWeights object to an array of option/count pairs
        const votesArray = Object.entries(vote.quadraticWeights).map(
          ([option, count]) => ({
            option,
            count,
          }),
        )

        return {
          id: index.toString(), // Generate an ID based on array index
          username: vote.username,
          votes: votesArray,
        }
      })

      setVoters(transformedVoters)
    }
  }, [votersData])

  const toggleVoter = (id: string) => {
    if (expandedVoter === id) {
      setExpandedVoter(null)
    } else {
      setExpandedVoter(id)
    }
  }

  const getTotalVotes = (votes: { option: string; count: number }[]) => {
    return votes.reduce((sum, vote) => sum + vote.count, 0)
  }

  // Render loading state
  if (isLoading) {
    return (
      <>
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">
              Check out how others voted in this poll
            </h2>
            <button onClick={() => setShowModal(true)}>
              <InfoIcon />
            </button>
          </div>
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading voters data...</p>
          </div>
        </div>
        {showModal && (
          <QuadraticInfoModal onClose={() => setShowModal(false)} />
        )}
      </>
    )
  }

  // Render error state
  if (error) {
    return (
      <>
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">
              Check out how others voted in this poll
            </h2>
            <button onClick={() => setShowModal(true)}>
              <InfoIcon />
            </button>
          </div>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">
              Failed to load voters data. Please try again later.
            </p>
          </div>
        </div>
        {showModal && (
          <QuadraticInfoModal onClose={() => setShowModal(false)} />
        )}
      </>
    )
  }

  // Render empty state
  if (!voters || voters.length === 0) {
    return (
      <>
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">
              Check out how others voted in this poll
            </h2>
            <button onClick={() => setShowModal(true)}>
              <InfoIcon />
            </button>
          </div>
          <div className="flex justify-center items-center h-40 text-center">
            <p className="text-gray-500">
              No one has voted on this poll.. yet, share it with your community!
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 font-medium active:scale-95 active:transition-transform active:duration-100"
            onClick={() => {
              sendHapticFeedbackCommand()
              handleSharePoll(pollTitle || '', Number(pollId))
            }}
          >
            <ShareIcon size={24} color="white" />
            Share this Poll
          </Button>
        </div>
        <CustomShareModal
          message={shareUrl}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        {showModal && (
          <QuadraticInfoModal onClose={() => setShowModal(false)} />
        )}
      </>
    )
  }

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">
          Check out how others voted in this poll
        </h2>
        <button onClick={() => setShowModal(true)}>
          <InfoIcon />
        </button>
      </div>

      <div className="space-y-2">
        {voters.map(voter => (
          <div key={voter.id} className="bg-gray-50 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleVoter(voter.id)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <UserIcon size={24} />
                </div>
                <span>{voter.username || 'Anon'}</span>
              </div>
              <div
                className={`transform transition-transform duration-300 ${expandedVoter === voter.id ? 'rotate-180' : ''}`}
              >
                <ChevronDownIcon />
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedVoter === voter.id
                  ? 'max-h-[500px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4">
                {voter.votes.map((vote, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[70%]">
                      {vote.option}
                    </span>
                    <span className="text-gray-400">
                      {vote.count.toFixed(2)} votes
                    </span>
                  </div>
                ))}
                <div className="text-right text-gray-500 border-t border-gray-200 mt-2 pt-2">
                  <span className="pr-1">Total votes:</span>
                  <span>{getTotalVotes(voter.votes).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && <QuadraticInfoModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
