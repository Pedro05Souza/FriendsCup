import { cn } from '../../lib/utils'

interface RatingBarProps {
  value: number
  max?: number
  showValue?: boolean
  className?: string
}

function barColor(pct: number) {
  if (pct >= 75) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function RatingBar({ value, max = 100, showValue = true, className }: RatingBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1 bg-gh-border rounded-full overflow-hidden min-w-[48px]">
        <div
          className={cn('h-full rounded-full transition-all', barColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="text-xs text-zinc-500 min-w-[20px] text-right">{value}</span>
      )}
    </div>
  )
}
