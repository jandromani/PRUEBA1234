import type React from 'react'
import { cn } from '@/utils'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  children: React.ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors px-6 py-4'

  const variantStyles = {
    primary: 'bg-gray-900 text-white',
    outline: 'border border-gray-300 bg-transparent text-gray-700',
    ghost: 'bg-transparent text-gray-700',
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
