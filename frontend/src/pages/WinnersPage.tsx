import { useQuery } from '@tanstack/react-query'
import { championshipsApi } from '../api/championships'
import type { ChampionshipWinnerEntry } from '../types'
import { cn, fmtCup } from '../lib/utils'
import PageHeader from '../components/ui/PageHeader'
import RankNumber from '../components/ui/RankNumber'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

export default function WinnersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['winners'],
    queryFn: championshipsApi.winners,
  })

  return (
    <>
      <PageHeader title="Hall of fame" description="Everyone who has lifted a cup, ordered by titles won." />

      {isLoading && <Loading />}
      {error && <ErrorNote error={error} />}

      {data && (
        <div className="panel overflow-hidden">
          {data.length === 0 && (
            <Empty title="No champions yet" hint="Finish a championship and its winner shows up here." />
          )}
          <ol className="divide-y divide-turf-line">
            {(data as ChampionshipWinnerEntry[]).map((w, i) => {
              const total = w.championships.reduce((s, c) => s + c.timesWon, 0)
              return (
                <li
                  key={w.playerId}
                  className={cn(
                    'grid grid-cols-[3rem,1fr,auto] items-center gap-4 px-5 sm:px-6 py-5',
                    i === 0 && 'bg-gold/[0.05]',
                  )}
                >
                  <RankNumber rank={i + 1} className="text-4xl" />
                  <div className="min-w-0">
                    <p className="font-display text-3xl font-extrabold leading-none text-chalk truncate">
                      {w.playerName}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {w.championships.map(c => (
                        <span
                          key={c.championshipName}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-chalk-muted bg-turf-raised border border-turf-line rounded-md px-2 py-1"
                        >
                          {fmtCup(c.championshipName)}
                          <span className="font-bold text-gold tabular-nums">×{c.timesWon}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-5xl font-black leading-none text-gold tabular-nums">{total}</p>
                    <p className="text-xs text-chalk-muted mt-1">{total === 1 ? 'title' : 'titles'}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </>
  )
}
