import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { playersApi } from '../api/players'
import type { Player, PlayerRanking } from '../types'
import { cn, fmtCup, ratingTone } from '../lib/utils'
import Dialog from '../components/ui/Dialog'
import RadarChart from '../components/ui/RadarChart'
import PageHeader from '../components/ui/PageHeader'
import RankNumber from '../components/ui/RankNumber'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

// Cup prestige weights (must mirror backend)
const CUP_WEIGHTS: Record<string, number> = {
  'COPA NABOR': 10,
  'COPA CHILELA': 7,
  'COPA DOUGLAS': 7,
  'COPA DEIVES': 4,
  'COPA POLAR': 3,
}

function WinBar({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const total = wins + draws + losses || 1
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-24 bg-turf-line gap-px" aria-hidden="true">
      <div className="bg-win" style={{ width: `${(wins / total) * 100}%` }} />
      <div className="bg-draw" style={{ width: `${(draws / total) * 100}%` }} />
      <div className="bg-loss" style={{ width: `${(losses / total) * 100}%` }} />
    </div>
  )
}

function PlayerProfileModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const axes = [
    { label: 'Attack', value: player.attack },
    { label: 'Defense', value: player.defense },
    { label: 'Intelligence', value: player.intelligence },
    { label: 'Mentality', value: player.mentality },
    { label: 'Overall', value: player.overrallRating },
  ]

  return (
    <Dialog open onClose={onClose} title={player.name} className="sm:max-w-sm">
      <div className="flex justify-center">
        <RadarChart axes={axes} size={230} />
      </div>
    </Dialog>
  )
}

const HEADERS: { label: string; className?: string }[] = [
  { label: 'Rank', className: 'w-16' },
  { label: 'Player' },
  { label: 'Score', className: 'text-right' },
  { label: 'OVR', className: 'text-right' },
  { label: 'Played', className: 'text-right' },
  { label: 'Won, drawn, lost' },
  { label: 'Win rate', className: 'text-right' },
  { label: 'Goals', className: 'text-right' },
  { label: 'Per match', className: 'text-right' },
  { label: 'Titles' },
]

export default function RankingsPage() {
  const [profilePlayer, setProfilePlayer] = useState<Player | null>(null)

  const { data: rankings, isLoading, error } = useQuery({
    queryKey: ['rankings'],
    queryFn: playersApi.rankings,
  })

  const { data: allPlayers } = useQuery({
    queryKey: ['players-all'],
    queryFn: playersApi.all,
  })

  const playerMap = new Map(allPlayers?.map(p => [p.id, p]) ?? [])

  const handleRowClick = (r: PlayerRanking) => {
    const p = playerMap.get(r.playerId)
    if (p) setProfilePlayer(p)
  }

  return (
    <>
      <PageHeader
        title="Rankings"
        description="The all-time table, weighted by win rate, titles and goals per match. Select a player to see their attributes."
      />

      {isLoading && <Loading />}
      {error && <ErrorNote error={error} />}

      {rankings && (
        <div className="panel overflow-hidden">
          {rankings.length === 0 ? (
            <Empty title="No ranked players yet" hint="Players appear here once they have played a match." />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-turf-line text-chalk-faint">
                    {HEADERS.map(h => (
                      <th
                        key={h.label}
                        className={cn('px-4 py-3 text-left text-xs font-semibold whitespace-nowrap', h.className)}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(rankings as PlayerRanking[]).map(r => (
                    <tr
                      key={r.playerId}
                      onClick={() => handleRowClick(r)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleRowClick(r)}
                      tabIndex={0}
                      className={cn(
                        'border-b border-turf-line/60 last:border-0 transition-colors cursor-pointer',
                        'hover:bg-turf-raised/60 focus-visible:bg-turf-raised/60',
                        r.rank === 1 && 'bg-gold/[0.05]',
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <RankNumber rank={r.rank} />
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[15px] text-chalk whitespace-nowrap">
                        {r.playerName}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-display text-2xl font-extrabold tabular-nums text-chalk">
                          {r.rankingScore}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={cn('font-display text-xl font-bold tabular-nums', ratingTone(r.overallRating))}>
                          {r.overallRating}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-chalk-muted">{r.matchesPlayed}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs tabular-nums whitespace-nowrap">
                            <span className="text-win font-semibold">{r.wins}</span>
                            <span className="text-chalk-faint"> · </span>
                            <span className="text-draw font-semibold">{r.draws}</span>
                            <span className="text-chalk-faint"> · </span>
                            <span className="text-loss font-semibold">{r.losses}</span>
                          </span>
                          <WinBar wins={r.wins} draws={r.draws} losses={r.losses} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{r.winRate}%</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-chalk-muted">{r.goalsScored}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-chalk-muted">{r.avgGoalsPerMatch}</td>
                      <td className="px-4 py-3.5">
                        {r.titlesWon > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(r.titlesByChampionship).map(([cup, count]) => (
                              <span
                                key={cup}
                                title={cup}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-chalk-muted bg-turf-raised border border-turf-line rounded-md px-1.5 py-0.5 whitespace-nowrap"
                              >
                                {fmtCup(cup)}
                                {count > 1 && <span className="font-bold text-gold">×{count}</span>}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-chalk-faint">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {rankings && rankings.length > 0 && (
        <section className="mt-6 grid gap-6 md:grid-cols-[1fr,1.4fr] items-start px-1">
          <div>
            <h2 className="font-display text-xl font-bold text-chalk">How the score works</h2>
            <p className="text-sm text-chalk-muted mt-1.5 leading-relaxed">
              Win rate × 0.5, plus trophy points, plus goals per match × 5. Bigger cups are worth more.
            </p>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(CUP_WEIGHTS).map(([cup, w]) => (
              <div key={cup} className="rounded-lg border border-turf-line bg-turf-surface/70 px-3 py-2">
                <dt className="text-xs text-chalk-muted">{fmtCup(cup)}</dt>
                <dd className="font-display text-2xl font-extrabold text-chalk tabular-nums leading-tight">
                  {w}
                  <span className="ml-1 text-xs font-sans font-medium text-chalk-faint">pts</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {profilePlayer && <PlayerProfileModal player={profilePlayer} onClose={() => setProfilePlayer(null)} />}
    </>
  )
}
