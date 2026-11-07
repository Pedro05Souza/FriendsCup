import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import Spinner from './Spinner'

export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-16', className)}>
      <Spinner />
    </div>
  )
}

export function ErrorNote({ error, className }: { error: unknown; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 text-sm text-loss bg-loss/[0.07] border border-loss/25 rounded-xl px-4 py-3',
        className,
      )}
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{(error as Error)?.message ?? 'Something went wrong'}</span>
    </div>
  )
}

export function Empty({
  title,
  hint,
  className,
}: {
  title: string
  hint?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <p className="font-display text-2xl font-bold text-chalk-muted">{title}</p>
      {hint && <p className="mt-1.5 text-sm text-chalk-faint">{hint}</p>}
    </div>
  )
}
