import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Swords } from 'lucide-react'
import { matchesApi } from '../api/matches'
import type { MatchHistoryDto, Rivalry } from '../types'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import Spinner from '../components/ui/Spinner'
import { cn } from '../lib/utils'

// ── Rivalries list ───────────────────────────────────────────────────────────

function RivalryCard({
  r,
  onSelect,
}: {
  r: Rivalry
  onSelect: (p1: string, p2: string) => void
}) {
  const total = r.matchesPlayed || 1
  const p1Pct = (r.player1Wins / total) * 100
  const drawPct = (r.draws / total) * 100
  const p2Pct = (r.player2Wins / total) * 100

  return (
    <button
      onClick={() => onSelect(r.player1Id, r.player2Id)}
      className="w-full bg-gh-bg border border-gh-border/50 rounded-lg px-4 py-3 hover:border-gh-border hover:bg-gh-elevated/40 transition-colors text-left"
    >
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 mb-2">
        <span className="text-sm font-semibold text-zinc-100 text-right">{r.player1Name}</span>
        <span className="text-xs font-bold text-zinc-500 tabular-nums">{r.player1Wins}–{r.draws}–{r.player2Wins}</span>
        <span className="text-sm font-semibold text-zinc-100">{r.player2Name}</span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden">
        <div className="bg-emerald-500 transition-all" style={{ width: `${p1Pct}%` }} />
        <div className="bg-zinc-600 transition-all" style={{ width: `${drawPct}%` }} />
        <div className="bg-blue-500 transition-all" style={{ width: `${p2Pct}%` }} />
      </div>
      <p className="text-xs text-zinc-600 mt-1.5 text-center">{r.matchesPlayed} matches</p>
    </button>
  )
}

// ── H2H result ───────────────────────────────────────────────────────────────

function H2HResult({ data }: { data: MatchHistoryDto }) {
  const total = data.matchesPlayed || 1
  const winPct = (data.matchesWon / total) * 100
  const drawPct = (data.matchesDrawn / total) * 100
  const lossPct = (data.matchesLost / total) * 100

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Played" value={data.matchesPlayed} />
        <StatCard label="Won (P1)" value={data.matchesWon} valueClassName="text-emerald-400" />
        <StatCard label="Lost (P1)" value={data.matchesLost} valueClassName="text-red-400" />
        <StatCard label="Draws" value={data.matchesDrawn} valueClassName="text-amber-400" />
      </div>

      <div className="bg-gh-surface border border-gh-border rounded-lg p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
          Win distribution
        </p>
        <div className="flex h-2.5 rounded-full overflow-hidden mb-3">
          <div className="bg-emerald-500 transition-all" style={{ width: `${winPct}%` }} />
          <div className="bg-amber-500 transition-all" style={{ width: `${drawPct}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${lossPct}%` }} />
        </div>
        <div className="flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Wins {data.winRate}%</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Draws {drawPct.toFixed(1)}%</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Losses {lossPct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Goals Scored" value={data.goalsScored} />
        <StatCard label="Goals Conceded" value={data.goalsConceded} />
        <StatCard label="Biggest Win" value={`+${data.biggestWinDifference}`} valueClassName="text-emerald-400" />
        <StatCard label="Biggest Loss" value={`-${data.biggestLossDifference}`} valueClassName="text-red-400" />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function H2HPage() {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [query, setQuery] = useState<{ p1: string; p2: string } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['h2h', query?.p1, query?.p2],
    queryFn: () => matchesApi.h2h(query!.p1, query!.p2),
    enabled: !!query,
  })

  const { data: rivalries, isLoading: rivalriesLoading } = useQuery({
    queryKey: ['rivalries'],
    queryFn: matchesApi.rivalries,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!p1.trim() || !p2.trim()) { toast.error('Both player IDs are required'); return }
    setQuery({ p1: p1.trim(), p2: p2.trim() })
  }

  const handleRivalrySelect = (rid1: string, rid2: string) => {
    setP1(rid1)
    setP2(rid2)
    setQuery({ p1: rid1, p2: rid2 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputCls = 'w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors'

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Head to Head</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Match history between two players</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 items-start">
        {/* Main content */}
        <div className="space-y-4">
          <div className="bg-gh-surface border border-gh-border rounded-lg p-5">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end mb-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Player 1 (perspective)</label>
                  <input value={p1} onChange={e => setP1(e.target.value)} placeholder="UUID…" className={inputCls} />
                </div>
                <div className="flex items-center justify-center pb-1">
                  <Swords className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Player 2 (opponent)</label>
                  <input value={p2} onChange={e => setP2(e.target.value)} placeholder="UUID…" className={inputCls} />
                </div>
              </div>
              <Button variant="primary" type="submit" loading={isLoading}>Compare</Button>
            </form>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              {(error as Error).message}
            </p>
          )}

          {isLoading && <div className="flex justify-center py-12"><Spinner /></div>}
          {data && <H2HResult data={data as MatchHistoryDto} />}
        </div>

        {/* Rivalries sidebar */}
        <div className="bg-gh-surface border border-gh-border rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Top Rivalries
          </p>
          {rivalriesLoading && <div className="flex justify-center py-6"><Spinner /></div>}
          {rivalries && (
            <div className="space-y-2">
              {(rivalries as Rivalry[]).length === 0 && (
                <p className="text-xs text-zinc-600 text-center py-4">No rivalries yet</p>
              )}
              {(rivalries as Rivalry[]).map((r, i) => (
                <div key={i} className={cn(i > 4 && 'opacity-60')}>
                  <RivalryCard r={r} onSelect={handleRivalrySelect} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
