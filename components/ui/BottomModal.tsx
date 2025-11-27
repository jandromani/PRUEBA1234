import { useRef, useState, useEffect } from 'react'

interface FilterModalProps {
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  children: React.ReactNode
}

export default function BottomModal({
  modalOpen,
  setModalOpen,
  children,
}: FilterModalProps) {
  const downModalRef = useRef<HTMLDivElement>(null)
  const [modalOffset, setModalOffset] = useState(0)
  const [startY, setStartY] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleStart = (y: number) => {
    setStartY(y)
    setIsDragging(true)
  }

  const handleMove = (y: number) => {
    if (!isDragging || startY === null) return
    const diff = y - startY
    if (diff > 0) setModalOffset(diff)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setStartY(null)
    if (modalOffset > 150) setModalOpen(false)
    else setModalOffset(0)
  }

  // Handle touch/mouse unified
  const handleTouchStart = (e: React.TouchEvent) =>
    handleStart(e.touches[0].clientY)
  const handleTouchMove = (e: React.TouchEvent) =>
    handleMove(e.touches[0].clientY)
  const handleTouchEnd = () => handleEnd()

  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientY)
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientY)
  const handleMouseUp = () => handleEnd()

  useEffect(() => {
    if (modalOpen) setModalOffset(0)
  }, [modalOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downModalRef.current &&
        !downModalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false)
      }
    }

    if (modalOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [modalOpen])

  useEffect(() => {
    if (modalOpen) {
      document.documentElement.classList.add('overflow-hidden')
    } else {
      document.documentElement.classList.remove('overflow-hidden')
    }

    return () => {
      document.documentElement.classList.remove('overflow-hidden')
    }
  }, [modalOpen])

  if (!modalOpen) return null
  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={downModalRef}
        className="bg-white rounded-t-3xl w-full max-w-md animate-slide-up pb-4"
        style={{
          animationDuration: '300ms',
          animationFillMode: 'forwards',
          transform: `translateY(${modalOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grab bar */}
        <div
          className="pt-6 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={e => {
            e.stopPropagation()
            handleTouchStart(e)
          }}
          onMouseDown={e => {
            e.stopPropagation()
            handleMouseDown(e)
          }}
        >
          <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
