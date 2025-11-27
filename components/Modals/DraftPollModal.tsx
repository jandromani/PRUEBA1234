import { sendHapticFeedbackCommand } from '@/utils/animation'
import BottomModal from '../ui/BottomModal'
import { Button } from '../ui/Button'

type DraftPollModalProps = {
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  onSaveAsDraft: () => void
  onDelete: () => void
}

export default function DraftPollModal({
  modalOpen,
  setModalOpen,
  onSaveAsDraft,
  onDelete,
}: DraftPollModalProps) {
  return (
    <BottomModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
      <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8 text-sora">
        Unsaved changes
      </h2>
      <p className="text-center text-gray-700 mb-8 text-sora">
        Do you want to save your poll as a draft? You can return and finish it
        up later.
      </p>
      <div className="flex flex-col gap-4 justify-center">
        <Button
          className="text-sm font-semibold font-sora active:scale-95 active:transition-transform active:duration-100"
          onClick={() => {
            sendHapticFeedbackCommand()
            onSaveAsDraft()
          }}
        >
          Save as Draft
        </Button>
        <Button
          variant="ghost"
          className="text-sm font-semibold font-sora text-gray-500 hover:bg-gray-300/90 active:scale-95 active:bg-gray-300/90 active:shadow-inner transition-none active:transition-transform active:duration-100"
          onClick={() => {
            sendHapticFeedbackCommand()
            onDelete()
          }}
        >
          Delete
        </Button>
      </div>
    </BottomModal>
  )
}
