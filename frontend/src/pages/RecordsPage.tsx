import { useQuery } from '@tanstack/react-query'
import { Goal, Gamepad2, Trophy, TrendingUp, Zap, Flame, type LucideIcon } from 'lucide-react'
import { championshipsApi } from '../api/championships'
import type { AllTimeRecords } from '../types'
import { cn, fmtCup, fmtPhase } from '../lib/utils'
import PageHeader from '../components/ui/PageHeader'
import { ErrorNote, Loading } from '../components/ui/States'

interface RecordCardProps {
  icon: LucideIcon
  title: string
  holder: string
  metric: string
  unit?: string
  sub?: string
  featured?: boolean
}

function RecordCard({ icon: Icon, title, holder, metric, unit, sub, featured }: RecordCardProps) {
  return (
    <article
      className={cn(
        'panel p-6 flex flex-col',
        featured && 'border-gold/35 bg-[linear-gradient(160deg,rgba(242,193,78,0.08),transparent_55%)]',
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-chalk-muted">
        <Icon className="w-4 h-4 text-gold" />
        {title}
      </div>
      <p className="mt-5 font-display font-black leading-[0.85] tabular-nums text-chalk text-7xl">
        {metric}
        {unit && <span className="ml-2 text-2xl font-bold text-chalk-muted">{unit}</span>}
      </p>
      <p className="mt-4 text-lg font-semibold text-chalk truncate">{holder}</p>
      {sub && <p className="text-sm text-chalk-faint mt-0.5 truncate">{sub}</p>}
    </article>
  )
}

export default function RecordsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['records'],
    queryFn: championshipsApi.records,
  })

  return (
    <>
      <PageHeader
        title="All-time records"
        description="The numbers that have survived every cup so far. Go and break one."
      />

      {isLoading && <Loading />}
      {error && <ErrorNote error={error} />}

      {data && (() => {
        const d = data as AllTimeRecords
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.topScorer && (
              <RecordCard
                featured
                icon={Goal}
                title="Top scorer"
                holder={d.topScorer.playerName}
                metric={String(d.topScorer.value)}
                unit="goals"
              />
            )}

            {d.mostTitles && (
              <RecordCard
                featured
                icon={Trophy}
                title="Most titles"
                holder={d.mostTitles.playerName}
                metric={String(d.mostTitles.value)}
                unit={d.mostTitles.value === 1 ? 'title' : 'titles'}
              />
            )}

            {d.highestWinRate && (
              <RecordCard
                icon={TrendingUp}
                title="Highest win rate"
                holder={d.highestWinRate.playerName}
                metric={`${d.highestWinRate.winRate}%`}
                sub={`Across ${d.highestWinRate.matchesPlayed} matches`}
              />
            )}

            {d.mostMatchesPlayed && (
              <RecordCard
                icon={Gamepad2}
                title="Most matches played"
                holder={d.mostMatchesPlayed.playerName}
                metric={String(d.mostMatchesPlayed.value)}
                unit="matches"
              />
            )}

            {d.biggestWin && (
              <RecordCard
                icon={Zap}
                title="Biggest win"
                holder={`${d.biggestWin.playerName} over ${d.biggestWin.opponentName}`}
                metric={d.biggestWin.scoreline ?? `+${d.biggestWin.value}`}
                sub={`${fmtCup(d.biggestWin.championship)}, ${fmtPhase(d.biggestWin.phase).toLowerCase()}`}
              />
            )}

            {d.mostGoalsInOneMatch && (
              <RecordCard
                icon={Flame}
                title="Most goals in one match"
                holder={d.mostGoalsInOneMatch.playerName}
                metric={String(d.mostGoalsInOneMatch.value)}
                unit="goals"
                sub={`${fmtCup(d.mostGoalsInOneMatch.championship)}, ${fmtPhase(d.mostGoalsInOneMatch.phase).toLowerCase()}`}
              />
            )}
          </div>
        )
      })()}
    </>
  )
}
