'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useUserData } from '@/hooks/useUser'
import { Toaster } from '../Toaster'
import BlurredCard from '../Verify/BlurredCard'

interface UserDataProps {
  worldId?: string
}

export default function ProfileInfo({ worldId }: UserDataProps) {
  const { worldID: authWorldId } = useAuth()
  const effectiveWorldId = worldId || authWorldId

  const { data: userData, isLoading, error } = useUserData(effectiveWorldId)

  return (
    <motion.div
      className="rounded-3xl bg-gray-200 p-6 text-gray-900 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster />
      <div className="flex gap-4 items-center mb-4">
        <Image
          src={userData?.worldProfilePic || '/verify/anonymous-user.png'}
          alt="User"
          width={80}
          height={80}
          className="rounded-full border-4 border-gray-300"
        />

        <div>
          <p className="text-base">{userData?.name || 'Anon User'}</p>
          <p className="text-sm text-gray-500">{userData?.worldID || 'Not linked'}</p>
        </div>
      </div>

      {isLoading ? (
        <BlurredCard />
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
              <p className="text-gray-900 text-sm">Hosted</p>
              <p className="text-2xl font-semibold text-primary font-sora">
                {userData?.tournamentsHosted || 0}
              </p>
            </div>

            <div className="absolute top-4 bottom-4 left-1/2 w-px bg-gray-200" />

            <div className="text-center flex-1">
              <p className="text-gray-900 text-sm">Joined</p>
              <p className="text-2xl font-semibold text-primary font-sora">
                {userData?.tournamentsJoined || 0}
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
