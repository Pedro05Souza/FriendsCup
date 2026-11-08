import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '../api/matches'
import { cn, pct } from '../lib/utils'
import { ErrorNote, Loading } from './ui/States'

/** Fewer 1v1 matches than this and a player's rating is mostly the league average. */
const THIN_RECORD = 6

/** Heat colour for one cell of the scoreline grid. */
function cellStyle(p: number, max: number, side: 'player' | 'opponent' | 'draw') {
  const intensity = Math.min(1, p / max)
  const rgb = side === 'player' ? '242,193,78' : side === 'opponent' ? '127,176,224' : '159,177,167'
  return { backgroundColor: `rgba(${rgb},${0.06 + intensity * 0.6})` }
}

export default function PredictionCard({ playerId, opponentId }: { playerId: string; opponentId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['prediction', playerId, opponentId],
    queryFn: () => matchesApi.prediction(playerId, opponentId),
  })

  if (isLoading) return <Loading className="py-8" />
  if (error) return <ErrorNote error={error} />
  if (!data) return null

  const { player: a, opponent: b, drawProbability: draw } = data
  const cells = data.scoreMatrix.flat()
  const max = Math.max(...cells)
  const thin = [a, b].filter(s => s.matchesInModel < THIN_RECORD)
  const goals = data.scoreMatrix.map((_, i) => i)

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 sm:px-6 pt-5">
        <h2 className="panel-title">Next time they play</h2>
        <p className="text-sm text-chalk-faint">Model prediction</p>
      </div>

      {/* Odds */}
      <div className="px-5 sm:px-6 pt-5">
        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-chalk-muted truncate">{a.playerName} wins</p>
            <p className="font-display text-6xl font-black leading-[0.85] tabular-nums text-gold mt-1">
              {pct(a.winProbability)}
            </p>
          </div>
          <div className="text-center pb-1">
            <p className="font-display text-3xl font-extrabold leading-none tabular-nums text-chalk-muted">{pct(draw)}</p>
            <p className="text-xs text-chalk-faint mt-1">draw</p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold text-chalk-muted truncate">{b.playerName} wins</p>
            <p className="font-display text-6xl font-black leading-[0.85] tabular-nums text-lower mt-1">
              {pct(b.winProbability)}
            </p>
          </div>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden mt-5 gap-0.5 bg-turf-line" aria-hidden="true">
          <div className="bg-gold" style={{ width: `${a.winProbability * 100}%` }} />
          <div className="bg-draw/60" style={{ width: `${draw * 100}%` }} />
          <div className="bg-lower" style={{ width: `${b.winProbability * 100}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr,auto] gap-6 px-5 sm:px-6 py-6">
        {/* Expected goals and likely scores */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-chalk-muted mb-1">Expected goals</p>
            <p className="font-display text-3xl font-extrabold tabular-nums text-chalk leading-none">
              <span className="text-gold">{a.expectedGoals.toFixed(1)}</span>
              <span className="text-chalk-faint mx-2">–</span>
              <span className="text-lower">{b.expectedGoals.toFixed(1)}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-chalk-muted mb-2">Most likely scores</p>
            <ol className="flex flex-wrap gap-2">
              {data.likelyScores.map((s, i) => (
                <li
                  key={i}
                  className={cn(
                    'rounded-lg border px-3 py-1.5',
                    i === 0 ? 'border-gold/40 bg-gold/[0.08]' : 'border-turf-line',
                  )}
                >
                  <span className="font-display text-xl font-extrabold tabular-nums text-chalk">
                    {s.player}–{s.opponent}
                  </span>
                  <span className="ml-2 text-xs tabular-nums text-chalk-faint">{pct(s.probability)}</span>
                </li>
              ))}
            </ol>
          </div>
          {thin.length > 0 && (
            <p className="text-xs leading-relaxed text-chalk-faint max-w-sm">
              {thin.map(s => `${s.playerName} has ${s.matchesInModel} 1v1 ${s.matchesInModel === 1 ? 'match' : 'matches'}`).join(' and ')}
              , so this leans on the league average.
            </p>
          )}
        </div>

        {/* Scoreline grid */}
        <figure>
          <table className="border-separate border-spacing-[3px] text-[11px] tabular-nums" aria-label="Chance of each exact score">
            <thead>
              <tr>
                <th className="w-6" />
                {goals.map(j => (
                  <th key={j} className="w-8 font-semibold text-lower text-center">{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.scoreMatrix.map((row, i) => (
                <tr key={i}>
                  <th className="font-semibold text-gold text-right pr-1">{i}</th>
                  {row.map((p, j) => (
                    <td
                      key={j}
                      title={`${a.playerName} ${i}–${j} ${b.playerName}: ${(p * 100).toFixed(1)}%`}
                      className="h-7 w-8 rounded text-center text-chalk/80"
                      style={cellStyle(p, max, i > j ? 'player' : i < j ? 'opponent' : 'draw')}
                    >
                      {p >= 0.02 ? Math.round(p * 100) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-2 text-xs text-chalk-faint">
            Chance of each score in %. <span className="text-gold">{a.playerName}</span> down,{' '}
            <span className="text-lower">{b.playerName}</span> across.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
