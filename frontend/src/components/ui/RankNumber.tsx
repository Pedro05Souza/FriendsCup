import { cn } from '../../lib/utils'

const PODIUM = ['text-gold', 'text-silver', 'text-bronze']

/** Rank numeral in display type; gold, silver and bronze for the podium. */
export default function RankNumber({
  rank,
  className,
}: {
  rank: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-display font-black tabular-nums leading-none text-3xl inline-block min-w-[1.4ch] text-center',
        PODIUM[rank - 1] ?? 'text-chalk-faint',
        className,
      )}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  )
}
