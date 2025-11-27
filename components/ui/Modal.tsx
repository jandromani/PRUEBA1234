'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, children, className = '' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus trap logic for accessibility
  useEffect(() => {
    if (open && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [open])

  useEffect(() => {
    if (!onClose) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-xl max-w-sm w-full max-h-[90vh] overflow-auto ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
