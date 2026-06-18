import { useQuery } from '@tanstack/react-query'
import { championshipsApi } from '../api/championships'
import type { ChampionshipWinnerEntry } from '../types'
import { medal } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

export default function WinnersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['winners'],
    queryFn: championshipsApi.winners,
  })

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Hall of Fame</h1>
        <p className="text-sm text-zinc-500 mt-0.5">All-time championship winners</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          {(error as Error).message}
        </p>
      )}

      {data && (
        <div className="space-y-3">
          {data.length === 0 && (
            <div className="text-center py-16 text-zinc-600 text-sm">No winners yet</div>
          )}
          {(data as ChampionshipWinnerEntry[]).map((w, i) => {
            const total = w.championships.reduce((s, c) => s + c.timesWon, 0)
            return (
              <div
                key={w.playerId}
                className="bg-gh-surface border border-gh-border rounded-lg p-4 flex items-center gap-4"
              >
                <span className="text-2xl w-9 text-center shrink-0">{medal(i)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-zinc-100">{w.playerName}</span>
                    <Badge variant="yellow">{total} title{total !== 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {w.championships.map(c => (
                      <Badge key={c.championshipName} variant="green">
                        {c.championshipName} ×{c.timesWon}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
