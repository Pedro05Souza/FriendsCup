import { cn } from '../../lib/utils'

export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full border-2 border-gold/20 border-t-gold animate-spin',
        'w-5 h-5',
        className,
      )}
    />
  )
}
