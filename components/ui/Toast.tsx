import * as React from 'react'
import { cn } from '@/utils'

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn(
        'pointer-events-auto w-full overflow-hidden rounded-lg shadow-lg transition-all animate-in slide-in-from-bottom-full',
        className,
      )}
      ref={ref}
      {...props}
    >
      <div className="py-2 px-4">{children}</div>
    </div>
  )
})
Toast.displayName = 'Toast'

const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p className={cn('text-sm font-medium', className)} ref={ref} {...props} />
  )
})
ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      className={cn('text-sm opacity-90 text-center', className)}
      ref={ref}
      {...props}
    />
  )
})
ToastDescription.displayName = 'ToastDescription'

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export { Toast, ToastDescription, ToastTitle }
export type { ToastProps }
