'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useUserData } from '@/hooks/useUser'
import UserIcon from '../icon-components/UserIcon'

interface ProfileInfoProps {
  worldId?: string
}

export default function ProfileInfo({ worldId }: ProfileInfoProps) {
  const { worldID: authWorldId } = useAuth()
  const effectiveWorldId = worldId || authWorldId

  const { data: userData, isLoading, error } = useUserData(effectiveWorldId)

  return (
    <motion.div
      className="flex flex-col items-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
        <UserIcon size={32} />
      </div>

      {isLoading ? (
        <>
          {/* Loading skeleton for username */}
          <div className="w-32 h-8 bg-gray-200 rounded-lg mb-6 animate-pulse blur-sm" />

          {/* Loading skeleton for stats */}
          <div className="relative flex w-full justify-around border-y border-gray-200 py-4">
            <div className="text-center flex-1">
              <p className="text-gray-900 text-sm">Created</p>
              <div className="w-12 h-8 bg-gray-200 rounded-md mx-auto mt-1 animate-pulse blur-sm" />
            </div>

            <div className="absolute top-4 bottom-4 left-1/2 w-px bg-gray-200" />

            <div className="text-center flex-1">
              <p className="text-gray-900 text-sm">Participated</p>
              <div className="w-12 h-8 bg-gray-200 rounded-md mx-auto mt-1 animate-pulse blur-sm" />
            </div>
          </div>
        </>
      ) : error ? (
        <p className="text-red-500 text-sm">
          {(error as Error).message || 'An error occurred'}
        </p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 font-sora">
            {userData?.name ? `@${userData?.name}` : 'Anon'}
          </h2>

          <div className="relative flex w-full justify-around border-y border-gray-200 py-4">
            <div className="text-center flex-1">
              <p className="text-gray-900 text-sm">Created</p>
              <p className="text-2xl font-semibold text-primary font-sora">
                {userData?.pollsCreated || 0}
              </p>
            </div>

            <div className="absolute top-4 bottom-4 left-1/2 w-px bg-gray-200" />

            <div className="text-center flex-1">
              <p className="text-gray-900 text-sm">Participated</p>
              <p className="text-2xl font-semibold text-primary font-sora">
                {userData?.pollsParticipated || 0}
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
