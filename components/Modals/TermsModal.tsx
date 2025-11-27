'use client'

interface TermsOfServiceModalProps {
  onAccept: () => void
}

export default function TermsOfServiceModal({
  onAccept,
}: TermsOfServiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">
            WorldView Terms of Service
          </h2>

          <p className="mb-4">
            By using WorldView, you agree to the following terms:
          </p>

          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li>Use the app only with your verified World ID.</li>
            <li>Do not post illegal, harmful, or misleading content.</li>
            <li>
              Do not impersonate anyone, especially members of the World or
              WorldView teams.
            </li>
            <li>
              Do not promote scams, phishing attempts, or suspicious links.
            </li>
            <li>
              Do not offer rewards, payments, or incentives for votes outside
              the WorldView app.
            </li>
            <li>
              Do not request money, donations, or financial contributions from
              other users.
            </li>
            <li>
              Do not post content that damages or misrepresents WorldView,
              World, or their contributors, employees, or trademarks.
            </li>
          </ul>

          <p className="mb-4">
            Content that violates these terms will be removed without notice.
            Repeated violations may result in further restrictions.
          </p>

          <p className="mb-2">For questions, contact us at:</p>
          <p className="font-medium mb-6">info@generalmagic.io</p>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onAccept}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  )
}
