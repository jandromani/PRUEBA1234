'use client'

import Image from 'next/image'
import { sendHapticFeedbackCommand } from '@/utils/animation'

interface QuadraticInfoModalProps {
  onClose: () => void
}

export default function QuadraticInfoModal({
  onClose,
}: QuadraticInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="mb-4">
            <Image
              src="/illustrations/quadratic-voting.png"
              alt="Quadratic Voting Illustration"
              className="w-full rounded-lg"
              width={299}
              height={200}
            />
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">
            50x15 usa votación cuadrática
          </h2>

          <p className="text-center mb-6 text-gray-700">
            Quadratic Voting helps keep things fair by making sure no one person
            or group can control the outcome, even if they have a lot of voting
            power.
          </p>

          <p className="text-center mb-8 text-gray-700">
            The more votes you give to a single option, the more it costs. Each
            extra vote costs more than the last, so it's harder to dominate the
            results with just one strong opinion.
          </p>

          <button
            onClick={() => {
              sendHapticFeedbackCommand()
              onClose()
            }}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  )
}
