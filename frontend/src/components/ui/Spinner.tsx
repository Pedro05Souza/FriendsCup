import { cn } from '../../lib/utils'

export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin',
        'w-4 h-4',
        className,
      )}
    />
  )
}
