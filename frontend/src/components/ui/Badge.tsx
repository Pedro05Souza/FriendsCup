import { cn } from '../../lib/utils'

type Variant = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'default'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  green: 'bg-win/10 text-win border-win/25',
  yellow: 'bg-gold/10 text-gold border-gold/30',
  red: 'bg-loss/10 text-loss border-loss/25',
  blue: 'bg-lower/10 text-lower border-lower/25',
  purple: 'bg-silver/10 text-silver border-silver/25',
  default: 'bg-turf-raised text-chalk-muted border-turf-line',
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border whitespace-nowrap',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
