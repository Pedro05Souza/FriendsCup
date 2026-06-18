import { useQuery } from '@tanstack/react-query'
import { championshipsApi } from '../api/championships'
import type { AllTimeRecords } from '../types'
import { fmtPhase } from '../lib/utils'
import Spinner from '../components/ui/Spinner'

interface RecordCardProps {
  icon: string
  title: string
  holder: string
  metric: string
  sub?: string
}

function RecordCard({ icon, title, holder, metric, sub }: RecordCardProps) {
  return (
    <div className="bg-gh-surface border border-gh-border rounded-lg p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            {title}
          </p>
          <p className="text-base font-bold text-zinc-100 truncate">{holder}</p>
          <p className="text-2xl font-bold text-emerald-400 mt-0.5">{metric}</p>
          {sub && (
            <p className="text-xs text-zinc-600 mt-1 truncate">{sub}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecordsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['records'],
    queryFn: championshipsApi.records,
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">All-Time Records</h1>
        <p className="text-sm text-zinc-500 mt-0.5">The best (and worst) performances across every tournament</p>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner /></div>}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          {(error as Error).message}
        </p>
      )}

      {data && (() => {
        const d = data as AllTimeRecords
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.topScorer && (
              <RecordCard
                icon="⚽"
                title="Top Scorer (All Time)"
                holder={d.topScorer.playerName}
                metric={`${d.topScorer.value} goals`}
              />
            )}

            {d.mostMatchesPlayed && (
              <RecordCard
                icon="🎮"
                title="Most Matches Played"
                holder={d.mostMatchesPlayed.playerName}
                metric={`${d.mostMatchesPlayed.value} matches`}
              />
            )}

            {d.mostTitles && (
              <RecordCard
                icon="🏆"
                title="Most Titles"
                holder={d.mostTitles.playerName}
                metric={`${d.mostTitles.value} title${d.mostTitles.value !== 1 ? 's' : ''}`}
              />
            )}

            {d.highestWinRate && (
              <RecordCard
                icon="📈"
                title="Highest Win Rate"
                holder={d.highestWinRate.playerName}
                metric={`${d.highestWinRate.winRate}%`}
                sub={`in ${d.highestWinRate.matchesPlayed} matches`}
              />
            )}

            {d.biggestWin && (
              <RecordCard
                icon="💥"
                title="Biggest Win"
                holder={d.biggestWin.playerName}
                metric={d.biggestWin.scoreline ?? `+${d.biggestWin.value}`}
                sub={`vs ${d.biggestWin.opponentName} · ${d.biggestWin.championship} · ${fmtPhase(d.biggestWin.phase)}`}
              />
            )}

            {d.mostGoalsInOneMatch && (
              <RecordCard
                icon="🔥"
                title="Most Goals in One Match"
                holder={d.mostGoalsInOneMatch.playerName}
                metric={`${d.mostGoalsInOneMatch.value} goals`}
                sub={`${d.mostGoalsInOneMatch.championship} · ${fmtPhase(d.mostGoalsInOneMatch.phase)}`}
              />
            )}
          </div>
        )
      })()}
    </>
  )
}
