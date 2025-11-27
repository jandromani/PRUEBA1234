import { Toast, ToastTitle, ToastDescription } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description, position }) => (
        <div
          key={id}
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 w-fit max-w-[90%] rounded-lg ${
            position === 'top' ? 'top-4' : 'bottom-4'
          }`}
        >
          <Toast className="bg-gray-900 text-white text-sm w-full">
            <div className="flex flex-col gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
          </Toast>
        </div>
      ))}
    </>
  )
}
