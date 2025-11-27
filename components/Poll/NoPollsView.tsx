import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { sendHapticFeedbackCommand } from '@/utils/animation'
import { PlusIcon } from '../icon-components'
import { Button } from '../ui/Button'

export default function NoPollsView() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center px-6 pt-16">
      <div className="mb-10 relative">
        <Image
          src="/illustrations/no-polls.svg"
          alt="No polls"
          width={221}
          height={150}
        />
      </div>

      <h2 className="text-xl text-gray-900 font-medium mb-2">
        Quiet in here...
      </h2>
      <p className="text-gray-900 mb-8">Want to get things rolling?</p>

      <Button
        className="flex items-center gap-2 w-full max-w-xs mb-10"
        onClick={() => {
          sendHapticFeedbackCommand()
          router.push('/poll/create')
        }}
      >
        <PlusIcon color="white" />
        <span className="text-lg font-medium">Create a New Poll</span>
      </Button>
    </div>
  )
}
