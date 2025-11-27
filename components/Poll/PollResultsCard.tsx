import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  CheckIcon,
  InfoIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from '@/components/icon-components'
import { useAuth } from '@/context/AuthContext'
import { useDeletePoll, useGetPollDetails } from '@/hooks/usePoll'
import { useShare } from '@/hooks/useShare'
import { useGetUserVotes, useUserData } from '@/hooks/useUser'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { formatFloat } from '@/utils/number'
import { getRelativeTimeString } from '@/utils/time'
import {
  AnonymousIconWrapper,
  PublicIconWrapper,
} from '../icon-components/IconWrapper'
import PieChart from '../icon-components/PieChart'
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal'
import CustomShareModal from '../Modals/CustomShareModal'
import QuadraticInfoModal from '../Modals/QuadraticInfoModal'
import VotingTypesModal from '../Modals/VotingTypesModal'
import { Button } from '../ui/Button'

type VoteState = {
  option: string
  percentage: number
  count: number
}

export default function PollResultsCard({ pollId }: { pollId: number }) {
  const router = useRouter()
  const { worldID } = useAuth()
  const { handleShareResults, isOpen, setIsOpen, shareUrl } = useShare()

  const { data: pollData, isLoading } = useGetPollDetails(pollId)
  const { data: userVotes } = useGetUserVotes(pollId)
  const { mutate: deletePoll, isPending: deletePollPending } = useDeletePoll()
  const { data: userData } = useUserData()

  const pollDetails = pollData?.poll
  const isActive = pollData?.isActive
  const pollResults = pollData?.optionsTotalVotes
  const pollOptions = pollDetails?.options
  const totalVotes = pollData?.totalVotes
  const didVote = userVotes?.voteID
  const isAuthor = worldID === pollDetails?.author?.worldID
  const isAdmin = userData?.isAdmin || false

  const { timeLeft, isNotStarted } = getRelativeTimeString(
    pollDetails?.startDate ?? '',
    pollDetails?.endDate ?? '',
  )

  const [votes, setVotes] = useState<VoteState[]>()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVotingTypesModalOpen, setIsVotingTypesModalOpen] = useState(false)

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const [showQVInfoModal, setShowQVInfoModal] = useState(false)

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!pollResults) return

    const mappedVotes = pollOptions?.map(option => ({
      option: option,
      percentage: totalVotes ? (pollResults[option] / totalVotes) * 100 : 0,
      count: pollResults[option] ?? 0,
    }))

    setVotes(mappedVotes)
  }, [pollResults])

  const handleVote = () => {
    sendHapticFeedbackCommand()
    if (!isActive || isNotStarted) return
    router.push(`/poll/${pollId}`)
  }

  const handleDeletePoll = () => {
    sendHapticFeedbackCommand()
    deletePoll(
      { id: pollId },
      {
        onSuccess: () => {
          router.push('/')
          setShowConfirmDeleteModal(false)
        },
        onError: error => {
          setShowConfirmDeleteModal(false)
        },
      },
    )
  }

  const navigateToUserProfile = () => {
    sendHapticFeedbackCommand()
    if (pollDetails?.author?.worldID) {
      router.push(`/user/${pollDetails.author.worldID}`)
    }
  }

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => cancelAnimationFrame(timer)
  }, [])

  if (!pollId) return null

  return (
    <>
      <div
        className={`bg-white rounded-3xl border border-secondary overflow-hidden mb-4 p-4 shadow-[0px_0px_16px_0px_#00000029] transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {' '}
        <div className="flex justify-between items-center mb-3">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95 active:transition-transform active:duration-100"
            onClick={navigateToUserProfile}
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 rounded-full bg-gray-300 animate-pulse" />
              ) : (
                <UserIcon />
              )}
            </div>
            {isLoading ? (
              <div className="w-24 h-4 rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              <span className="text-sm text-gray-900">
                {pollDetails?.author?.name
                  ? `@${pollDetails?.author?.name}`
                  : 'Anon'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isLoading ? (
              <div className="w-24 h-4 rounded-full bg-gray-200 animate-pulse"></div>
            ) : (
              <>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isNotStarted
                      ? 'bg-[#eac138]'
                      : isActive
                        ? 'bg-success-900'
                        : 'bg-gray-400'
                  }`}
                />
                {isNotStarted ? (
                  <span className="text-sm text-gray-900">
                    Starting in {timeLeft}
                  </span>
                ) : isActive ? (
                  <span className="text-sm text-gray-900">
                    {timeLeft} <span className="text-xs">left</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-900">Voting Ended</span>
                )}
              </>
            )}
          </div>
        </div>
        {!isLoading && (
          <div
            className="flex items-center gap-2 mb-2"
            onClick={() => {
              sendHapticFeedbackCommand()
              setIsVotingTypesModalOpen(true)
            }}
          >
            {pollDetails?.isAnonymous ? (
              <AnonymousIconWrapper texty />
            ) : (
              <PublicIconWrapper texty />
            )}
          </div>
        )}
        {/* Poll Title + Description */}
        <div className="pb-2">
          {isLoading ? (
            <div className="space-y-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <h2 className="text-gray-900 text-xl font-medium leading-tight mb-2">
                {pollDetails?.title}
              </h2>

              {pollDetails?.description && (
                <>
                  <p
                    className={`text-gray-900 text-sm mb-1 ${
                      isExpanded ? '' : 'line-clamp-2'
                    }`}
                  >
                    {pollDetails?.description}
                  </p>
                  {pollDetails?.description.length > 100 && (
                    <button
                      className="text-gray-700 font-medium text-xs mb-4"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tags */}
          {isLoading ? (
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="flex gap-2 mb-4">
              {pollDetails?.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-0.5 bg-gray-300 border border-gray-300 text-gray-900 rounded-full font-medium text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Poll Options */}
          <div className="space-y-6 mb-4">
            {isLoading ? (
              <OptionsLoadingSkeleton />
            ) : (
              votes &&
              votes.map((vote, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="relative w-full h-10 bg-white rounded-lg overflow-hidden">
                      <div
                        className="absolute left-0 top-0 bottom-0 flex items-center gap-3 py-2 rounded-lg bg-gray-200 px-2"
                        style={{
                          width: `${vote.percentage}%`,
                          maxWidth: '100%',
                          borderRight:
                            vote.percentage > 0 ? '1px solid #d6d9dd' : 'none',
                          position: 'relative',
                        }}
                      >
                        <span className="text-gray-900 block text-ellipsis whitespace-nowrap">
                          {vote.option}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end ml-4 shrink-0">
                      <span className="text-gray-500 text-sm justify-end mr-4 whitespace-nowrap">
                        {formatFloat(vote.count)}{' '}
                        {vote.count === 1 ? 'Vote' : 'Votes'}{' '}
                      </span>
                      <span className="text-gray-900 text-sm w-12 text-right">
                        {formatFloat(vote.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Poll Footer */}
          <div className="border-t border-gray-200 py-4 flex justify-between items-center">
            <div className="flex items-center gap-x-2">
              {isLoading ? (
                <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              ) : (
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <span className="text-gray-900 font-medium">
                    {pollDetails?.participantCount}
                  </span>
                  {!didVote ? (
                    `${
                      pollDetails?.participantCount === 1 ? 'voter' : 'voters'
                    } participated`
                  ) : (
                    <span className="flex items-center gap-2">votes</span>
                  )}

                  {didVote && (
                    <div className="bg-success-300 text-success-900 px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                      <span>You voted</span>
                      <CheckIcon size={12} color="#18964F" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                className="rounded-full h-8 w-8 disabled:opacity-50"
                onClick={() => {
                  sendHapticFeedbackCommand()
                  setShowQVInfoModal(true)
                }}
                disabled={isLoading}
              >
                <InfoIcon />
              </button>
              <button
                className="rounded-full h-8 w-8 disabled:opacity-50 active:scale-95 active:transition-transform active:duration-100"
                onClick={() => {
                  sendHapticFeedbackCommand()
                  handleShareResults(pollDetails?.title ?? '', pollId)
                }}
                disabled={isLoading}
              >
                <ShareIcon />
              </button>
            </div>
          </div>

          {/* Vote button */}
          <button
            className="w-full bg-gray-900 text-white h-14 rounded-xl mb-3 font-semibold font-sora disabled:text-gray-400 disabled:bg-gray-200 active:scale-95 active:transition-transform active:duration-100"
            onClick={handleVote}
            disabled={!isActive || isNotStarted}
          >
            {isNotStarted
              ? `Starting in ${timeLeft}`
              : isActive
                ? 'Vote'
                : 'Voting Ended'}
          </button>
          {!pollData?.poll?.isAnonymous && (
            <Link
              className="w-full flex items-center justify-center bg-gray-50 gap-2 py-3 text-gray-700 font-semibold rounded-xl font-sora active:scale-95 active:transition-transform active:duration-100"
              href={`/voters/${pollId}`}
              onClick={() => sendHapticFeedbackCommand()}
            >
              <PieChart />
              View Voters
            </Link>
          )}

          {(isAuthor || isAdmin) && (
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-3 text-error-800 text-sm font-semibold font-sora active:scale-95 active:transition-transform active:duration-100"
              onClick={() => {
                sendHapticFeedbackCommand()
                setShowConfirmDeleteModal(true)
              }}
            >
              <TrashIcon />
              Delete Poll
            </Button>
          )}
        </div>
        {(isAuthor || isAdmin) && (
          <ConfirmDeleteModal
            modalOpen={showConfirmDeleteModal}
            setModalOpen={setShowConfirmDeleteModal}
            onDelete={handleDeletePoll}
            isLoading={deletePollPending}
          />
        )}
        {isVotingTypesModalOpen && (
          <VotingTypesModal onClose={() => setIsVotingTypesModalOpen(false)} />
        )}
        <CustomShareModal
          message={shareUrl}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
      {showQVInfoModal && (
        <QuadraticInfoModal onClose={() => setShowQVInfoModal(false)} />
      )}
    </>
  )
}

const OptionsLoadingSkeleton = () => {
  return (
    <>
      {[1, 2, 3].map(index => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="relative w-full h-10 bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 h-full w-1/4 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-3 ml-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-10 h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-16 h-4 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </>
  )
}
