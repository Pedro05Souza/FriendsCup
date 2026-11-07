import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: React.ReactNode
  className?: string
  valueClassName?: string
}

export default function StatCard({ label, value, className, valueClassName }: StatCardProps) {
  return (
    <div className={cn('bg-turf-raised/60 border border-turf-line rounded-xl px-4 py-3', className)}>
      <div
        className={cn(
          'font-display text-4xl font-extrabold leading-none tabular-nums text-chalk',
          valueClassName,
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-xs text-chalk-muted">{label}</div>
    </div>
  )
}
