import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export default function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-[#04100B]/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          'relative z-10 w-full sm:max-w-md max-h-[92vh] overflow-y-auto scrollbar-thin',
          'bg-turf-surface border border-turf-line rounded-t-2xl sm:rounded-2xl shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <h2 className="font-display text-3xl font-extrabold leading-none text-chalk">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 p-2 rounded-md text-chalk-faint hover:text-chalk hover:bg-turf-raised transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
