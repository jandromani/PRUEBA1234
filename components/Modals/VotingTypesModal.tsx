'use client'

import {
  AnonymousIconWrapper,
  PublicIconWrapper,
} from '../icon-components/IconWrapper'

interface VotingTypesModalProps {
  onClose: () => void
}

export default function VotingTypesModal({ onClose }: VotingTypesModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            WorldView Voting Types
          </h2>

          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <PublicIconWrapper texty />
              <p className="text-center text-gray-700 mt-2">
                Everyone can see how each user voted by clicking "View Voters"
                on the poll results page.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <AnonymousIconWrapper texty />
              <p className="text-center text-gray-700 mt-2">
                Votes are hidden; only poll participation is visible on a user's
                profile.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium mt-8 hover:bg-gray-800 transition-colors"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  )
}
