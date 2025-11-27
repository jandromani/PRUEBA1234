'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { Toaster } from '@/components/Toaster'
import { useToast } from '@/hooks/useToast'
import { useWorldAuth } from '@/hooks/useWorldAuth'
import BlurredCard from '../Verify/BlurredCard'

export function SplashScreen() {
  const { handleLogin, isLoggingIn, isLoggedIn, error } = useWorldAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        description: error,
        position: 'top',
      })
    }
  }, [error])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!isLoggingIn && !isLoggedIn && (
        <div className="flex-1 flex flex-col items-center justify-between py-12">
          <div className="flex-1 flex flex-col items-center justify-center">
            <Image
              src="/logo.svg"
              alt="World ID"
              width={100}
              height={100}
              className="w-24 h-24"
            />
            <h1 className="text-[#191c20] text-4xl font-bold mt-4">
              WorldView
            </h1>
          </div>
          <div className="w-full max-w-md px-6 mt-auto">
            <button
              className="w-full bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold"
              onClick={handleLogin}
            >
              Login with World
            </button>
          </div>
        </div>
      )}
      {(isLoggingIn || isLoggedIn) && (
        <div className="flex flex-col items-center justify-center my-12 mx-4">
          <BlurredCard />
          <BlurredCard />
          <BlurredCard />
        </div>
      )}

      <Toaster />
    </div>
  )
}
