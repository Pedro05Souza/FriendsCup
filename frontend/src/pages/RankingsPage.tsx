import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { playersApi } from '../api/players'
import type { Player, PlayerRanking } from '../types'

// Cup display icons and prestige weights (must mirror backend)
const CUP_ICON: Record<string, string> = {
  'COPA NABOR': '🌍',    // Mundial
  'COPA CHILELA': '🏆',  // Libertadores/Champions
  'COPA DOUGLAS': '🤝',  // Mundial de Duplas
  'COPA DEIVES': '🎖️',   // Estadual
  'COPA POLAR': '❄️',    // Estadual de Duplas
}

const CUP_WEIGHTS: Record<string, number> = {
  'COPA NABOR': 10,
  'COPA CHILELA': 7,
  'COPA DOUGLAS': 7,
  'COPA DEIVES': 4,
  'COPA POLAR': 3,
}
import { cn } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Dialog from '../components/ui/Dialog'
import Spinner from '../components/ui/Spinner'
import RadarChart from '../components/ui/RadarChart'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return (
    <span className="text-sm font-bold text-zinc-500 w-6 text-center">
      {rank}
    </span>
  )
}

function WinBar({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const total = wins + draws + losses || 1
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-24">
      <div className="bg-emerald-500" style={{ width: `${(wins / total) * 100}%` }} />
      <div className="bg-amber-500" style={{ width: `${(draws / total) * 100}%` }} />
      <div className="bg-red-500" style={{ width: `${(losses / total) * 100}%` }} />
    </div>
  )
}

function PlayerProfileModal({
  player,
  onClose,
}: {
  player: Player
  onClose: () => void
}) {
  const axes = [
    { label: 'Attack', value: player.attack },
    { label: 'Defense', value: player.defense },
    { label: 'Intelligence', value: player.intelligence },
    { label: 'Mentality', value: player.mentality },
    { label: 'Overall', value: player.overrallRating },
  ]

  return (
    <Dialog open onClose={onClose} title={player.name} className="max-w-sm">
      <div className="flex flex-col items-center gap-4">
        <RadarChart axes={axes} size={220} />
        <div className="grid grid-cols-2 gap-2 w-full text-sm">
          {axes.map(a => (
            <div key={a.label} className="flex justify-between bg-gh-elevated rounded px-3 py-1.5">
              <span className="text-zinc-500">{a.label}</span>
              <span className="font-bold text-zinc-100">{a.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}

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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Player Rankings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Ranked by win rate · titles · avg goals. Click a row to see radar chart.
        </p>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner /></div>}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          {(error as Error).message}
        </p>
      )}

      {rankings && (
        <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gh-border">
                  {['#', 'Player', 'OVR', 'Played', 'W/D/L', 'Win Rate', 'Goals', 'Avg', 'Titles', 'Score'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rankings as PlayerRanking[]).map((r) => (
                  <tr
                    key={r.playerId}
                    onClick={() => handleRowClick(r)}
                    className={cn(
                      'border-b border-gh-border/40 last:border-0 transition-colors cursor-pointer',
                      'hover:bg-gh-elevated/60',
                      r.rank <= 3 && 'bg-emerald-500/[0.03]',
                    )}
                  >
                    <td className="px-4 py-3 w-10">
                      <RankBadge rank={r.rank} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-100 whitespace-nowrap">
                      {r.playerName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.overallRating >= 75 ? 'green' : r.overallRating >= 50 ? 'yellow' : 'red'}>
                        {r.overallRating}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{r.matchesPlayed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 whitespace-nowrap">
                          <span className="text-emerald-400">{r.wins}</span>
                          {' / '}
                          <span className="text-amber-400">{r.draws}</span>
                          {' / '}
                          <span className="text-red-400">{r.losses}</span>
                        </span>
                        <WinBar wins={r.wins} draws={r.draws} losses={r.losses} />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{r.winRate}%</td>
                    <td className="px-4 py-3 text-zinc-400">{r.goalsScored}</td>
                    <td className="px-4 py-3 text-zinc-400">{r.avgGoalsPerMatch}</td>
                    <td className="px-4 py-3">
                      {r.titlesWon > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(r.titlesByChampionship).map(([cup, count]) => (
                            <span
                              key={cup}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 whitespace-nowrap"
                              title={cup}
                            >
                              {CUP_ICON[cup] ?? '🏅'} {count > 1 ? `×${count}` : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-400">{r.rankingScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rankings && (
        <div className="mt-4 bg-gh-surface border border-gh-border rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Score formula
          </p>
          <p className="text-xs text-zinc-500 mb-2">
            Score = winRate × 0.5 + trophy points + avgGoals × 5
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CUP_WEIGHTS).map(([cup, w]) => (
              <span key={cup} className="text-xs bg-gh-elevated border border-gh-border rounded px-2 py-1 text-zinc-400">
                {CUP_ICON[cup]} {cup} = {w} pts/title
              </span>
            ))}
          </div>
        </div>
      )}

      {profilePlayer && (
        <PlayerProfileModal
          player={profilePlayer}
          onClose={() => setProfilePlayer(null)}
        />
      )}
    </>
  )
}
