import { sendHapticFeedbackCommand } from '@/utils/animation'
import BottomModal from '../ui/BottomModal'
import { Button } from '../ui/Button'
type ConfirmDeleteModalProps = {
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  onDelete: () => void
  isLoading: boolean
}

export default function ConfirmDeleteModal({
  modalOpen,
  setModalOpen,
  onDelete,
  isLoading,
}: ConfirmDeleteModalProps) {
  if (!modalOpen) return null

  return (
    <BottomModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
      <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8 text-sora">
        Are you sure?
      </h2>
      <p className="text-center text-gray-700 mb-8 text-sora">
        This action is irreversible, and all collected data will be permanently
        deleted.
      </p>
      <div className="flex flex-col gap-4 justify-center">
        <Button
          className="text-sm font-semibold font-sora"
          onClick={onDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
        <Button
          variant="ghost"
          className="text-sm font-semibold font-sora text-gray-500"
          onClick={() => {
            sendHapticFeedbackCommand()
            setModalOpen(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </BottomModal>
  )
}
