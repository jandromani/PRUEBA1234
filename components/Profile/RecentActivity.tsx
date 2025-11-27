'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useUserActivities } from '@/hooks/useUserActivity'
import { UserActionDto } from '@/types/poll'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { transformActionToPoll } from '@/utils/helpers'
import { LazyPollCard } from '../Poll/PollCard'
import BlurredCard from '../Verify/BlurredCard'

interface UserActivitiesResponseDto {
  userActions: UserActionDto[]
}

interface RecentActivityProps {
  worldId?: string
}

const POLLS_PER_PAGE = 5

export default function RecentActivity({ worldId }: RecentActivityProps) {
  const { worldID: authWorldId } = useAuth()
  const effectiveWorldId = worldId || authWorldId
  const router = useRouter()

  const { data, isLoading, error } = useUserActivities({
    worldID: effectiveWorldId || '',
  })

  const activities = data?.userActions || []
  const displayActivities = activities.slice(0, POLLS_PER_PAGE)

  // Remove duplicate user actions based on pollId - where the user has voted on the poll that has been created by the user
  const uniqueUserActions = displayActivities.filter(
    (userAction, index, self) =>
      index === self.findIndex(t => t.pollId === userAction.pollId),
  )

  if (isLoading) {
    return (
      <div className="mb-4">
        <motion.h3
          className="text-lg font-medium mb-4 text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Recent Activity
        </motion.h3>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <BlurredCard key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-4">
        <motion.h3
          className="text-lg font-medium mb-4 text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Recent Activity
        </motion.h3>
        <motion.div
          className="flex justify-center py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-red-500">Failed to load activities</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <motion.h3
        className="text-lg font-medium mb-4 text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Recent Activity
      </motion.h3>
      {activities.length === 0 ? (
        <NoActivitiesView isMyProfile={!worldId} />
      ) : (
        <div className="space-y-4">
          {uniqueUserActions.map(action => (
            <LazyPollCard
              key={action.id}
              poll={transformActionToPoll(action)}
            />
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <button
          className="w-full bg-primary text-white font-medium text-lg py-3 rounded-lg mt-4 active:scale-95 active:transition-transform active:duration-100"
          onClick={() =>
            router.push(
              `/${worldId ? 'user' : 'profile'}Activities/${effectiveWorldId}`,
            )
          }
          onTouchStart={() => sendHapticFeedbackCommand()}
        >
          View all Activities
        </button>
      )}
    </div>
  )
}

function NoActivitiesView({ isMyProfile }: { isMyProfile: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg mt-16">
      <Image
        src="/illustrations/no-polls.svg"
        alt="No polls found illustration"
        width={221}
        height={150}
      />
      <p className="text-gray-900 font-medium mt-4 text-center">
        {isMyProfile
          ? 'No activities yet. Start exploring and engage!'
          : 'No voting activity from this user yet. Perhaps soon!'}
      </p>
    </div>
  )
}
