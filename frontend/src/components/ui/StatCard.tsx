import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: React.ReactNode
  className?: string
  valueClassName?: string
}

export default function StatCard({ label, value, className, valueClassName }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-gh-elevated border border-gh-border rounded-lg p-4 text-center',
        className,
      )}
    >
      <div className={cn('text-2xl font-bold text-emerald-400 leading-none', valueClassName)}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-zinc-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}
