import { useEffect, useRef } from 'react'
import Dialog from './Dialog'
import Button from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** What will happen, in plain words. */
  message: React.ReactNode
  /** Names the action, e.g. "Delete player". */
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/** Asks before a destructive action. Focus starts on Cancel so Enter never deletes by accident. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  return (
    <Dialog open={open} onClose={loading ? () => {} : onCancel} title={title} className="sm:max-w-sm">
      <div className="text-[15px] leading-relaxed text-chalk-muted">{message}</div>
      <div className="flex justify-end gap-2 mt-6">
        <Button ref={cancelRef} variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
