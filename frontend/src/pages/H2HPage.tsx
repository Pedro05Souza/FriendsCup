import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { matchesApi } from '../api/matches'
import { playersApi } from '../api/players'
import type { H2HMatchDetail, MatchHistoryDto, Player, Rivalry } from '../types'
import { cn, fmtCup, fmtPhase } from '../lib/utils'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import PageHeader from '../components/ui/PageHeader'
import { Empty, ErrorNote, Loading } from '../components/ui/States'
import { scrollToTop } from '../components/layout/Layout'

// ── Rivalries list ───────────────────────────────────────────────────────────

function classicLabel(score: number, played: number): { text: string; color: string } {
  if (played < 2) return { text: 'Too soon to tell', color: 'text-chalk-faint' }
  const ratio = score / played
  if (ratio >= 0.85) return { text: 'Classic', color: 'text-gold' }
  if (ratio >= 0.6) return { text: 'Rivalry', color: 'text-win' }
  if (ratio >= 0.3) return { text: 'Competitive', color: 'text-lower' }
  return { text: 'One-sided', color: 'text-chalk-faint' }
}

function RivalryCard({
  r,
  onSelect,
}: {
  r: Rivalry
  onSelect: (p1: string, p2: string) => void
}) {
  const total = r.matchesPlayed || 1
  const { text: label, color } = classicLabel(r.classicScore, r.matchesPlayed)

  return (
    <button
      onClick={() => onSelect(r.player1Id, r.player2Id)}
      className="w-full text-left px-4 py-3.5 rounded-xl hover:bg-turf-raised/70 transition-colors"
    >
      <div className="grid grid-cols-[1fr,auto,1fr] items-baseline gap-2">
        <span className="text-sm font-semibold text-chalk text-right truncate">{r.player1Name}</span>
        <span className="font-display text-xl font-extrabold tabular-nums text-chalk leading-none">
          {r.player1Wins}
          <span className="text-chalk-faint mx-1">–</span>
          {r.player2Wins}
        </span>
        <span className="text-sm font-semibold text-chalk truncate">{r.player2Name}</span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden mt-2.5 gap-px bg-turf-line" aria-hidden="true">
        <div className="bg-gold" style={{ width: `${(r.player1Wins / total) * 100}%` }} />
        <div className="bg-draw/60" style={{ width: `${(r.draws / total) * 100}%` }} />
        <div className="bg-lower" style={{ width: `${(r.player2Wins / total) * 100}%` }} />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className={cn('font-semibold', color)}>{label}</span>
        <span className="text-chalk-faint tabular-nums">
          {r.matchesPlayed} matches, {r.draws} {r.draws === 1 ? 'draw' : 'draws'}
        </span>
      </div>
    </button>
  )
}

// ── H2H result ───────────────────────────────────────────────────────────────

function H2HResult({ data, p1Name, p2Name }: { data: MatchHistoryDto; p1Name: string; p2Name: string }) {
  const total = data.matchesPlayed || 1
  const winPct = (data.matchesWon / total) * 100
  const drawPct = (data.matchesDrawn / total) * 100
  const lossPct = (data.matchesLost / total) * 100

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="panel p-6 sm:p-8">
        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-4 sm:gap-8">
          <div className="text-right min-w-0">
            <p className="text-sm font-semibold text-chalk-muted truncate">{p1Name}</p>
            <p className="font-display text-7xl sm:text-8xl font-black leading-[0.8] tabular-nums text-gold mt-2">
              {data.matchesWon}
            </p>
          </div>
          <div className="text-center pb-1">
            <p className="font-display text-4xl font-extrabold leading-none tabular-nums text-chalk-muted">
              {data.matchesDrawn}
            </p>
            <p className="text-xs text-chalk-faint mt-1">draws</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-chalk-muted truncate">{p2Name}</p>
            <p className="font-display text-7xl sm:text-8xl font-black leading-[0.8] tabular-nums text-lower mt-2">
              {data.matchesLost}
            </p>
          </div>
        </div>

        <div className="flex h-2 rounded-full overflow-hidden mt-8 gap-0.5 bg-turf-line" aria-hidden="true">
          <div className="bg-gold" style={{ width: `${winPct}%` }} />
          <div className="bg-draw/60" style={{ width: `${drawPct}%` }} />
          <div className="bg-lower" style={{ width: `${lossPct}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-chalk-muted tabular-nums">
          <span>{data.winRate}% won</span>
          <span>{data.matchesPlayed} played</span>
          <span>{lossPct.toFixed(1)}% lost</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Goals scored" value={data.goalsScored} />
        <StatCard label="Goals conceded" value={data.goalsConceded} />
        <StatCard label="Biggest win margin" value={`+${data.biggestWinDifference}`} valueClassName="text-win" />
        <StatCard label="Biggest loss margin" value={`−${data.biggestLossDifference}`} valueClassName="text-loss" />
      </div>
    </div>
  )
}

// ── Match detail list ────────────────────────────────────────────────────────

const RESULT_STYLE: Record<string, string> = {
  W: 'bg-win/15 text-win',
  D: 'bg-draw/15 text-draw',
  L: 'bg-loss/15 text-loss',
}

function MatchDetailList({ p1Id, p2Id }: { p1Id: string; p2Id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['h2h-details', p1Id, p2Id],
    queryFn: () => matchesApi.h2hDetails(p1Id, p2Id),
  })

  if (isLoading) return <Loading className="py-8" />
  if (!data || (data as H2HMatchDetail[]).length === 0)
    return (
      <div className="panel">
        <Empty title="They haven't met yet" hint="Record a match between these two and it will show up here." />
      </div>
    )

  // Reverse so oldest match is at the top (chronological read)
  const matches = [...(data as H2HMatchDetail[])].reverse()

  return (
    <section className="panel overflow-hidden">
      <div className="px-5 py-4 border-b border-turf-line flex items-baseline justify-between">
        <h2 className="panel-title">Every meeting</h2>
        <span className="text-sm text-chalk-faint tabular-nums">{matches.length}</span>
      </div>
      <ol className="divide-y divide-turf-line/60">
        {matches.map((m, i) => (
          <li key={i} className="grid grid-cols-[2rem,4rem,1fr,auto] items-center gap-3 px-5 py-3">
            <span
              className={cn(
                'inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold',
                RESULT_STYLE[m.result],
              )}
            >
              {m.result}
            </span>
            <span className="font-display text-2xl font-extrabold tabular-nums text-chalk text-center leading-none">
              {m.goalsP1}–{m.goalsP2}
            </span>
            <div className="min-w-0 truncate">
              <span className="text-sm font-medium text-chalk">{fmtCup(m.championship)}</span>
              <span className="text-sm text-chalk-faint ml-2">{fmtPhase(m.phase)}</span>
            </div>
            <span className="text-sm text-chalk-faint tabular-nums">{m.year}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function H2HPage() {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [query, setQuery] = useState<{ p1: string; p2: string } | null>(null)
  const [params] = useSearchParams()

  useEffect(() => {
    const a = params.get('p1'), b = params.get('p2')
    if (a) setP1(a)
    if (b) setP2(b)
    if (a && b && a !== b) setQuery({ p1: a, p2: b })
  }, [params])

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players-all'],
    queryFn: playersApi.all,
  })
  const players = allPlayers as Player[]
  const nameOf = (id: string) => players.find(p => p.id === id)?.name ?? 'Player'

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
    if (!p1 || !p2) { toast.error('Select both players'); return }
    if (p1 === p2) { toast.error('Pick two different players'); return }
    setQuery({ p1, p2 })
  }

  const handleRivalrySelect = (rid1: string, rid2: string) => {
    setP1(rid1)
    setP2(rid2)
    setQuery({ p1: rid1, p2: rid2 })
    scrollToTop()
  }

  return (
    <>
      <PageHeader title="Head to head" description="Pick two players to see every match they've played against each other." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          <form onSubmit={handleSubmit} className="panel p-5">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr,auto] gap-3 sm:items-end">
              <div>
                <label htmlFor="h2h-p1" className="field-label">Player</label>
                <select id="h2h-p1" value={p1} onChange={e => setP1(e.target.value)} className="field">
                  <option value="">Select a player</option>
                  {players.filter(p => p.id !== p2).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.overrallRating})</option>
                  ))}
                </select>
              </div>
              <span className="hidden sm:block font-display text-xl font-bold text-chalk-faint pb-2">vs</span>
              <div>
                <label htmlFor="h2h-p2" className="field-label">Opponent</label>
                <select id="h2h-p2" value={p2} onChange={e => setP2(e.target.value)} className="field">
                  <option value="">Select an opponent</option>
                  {players.filter(p => p.id !== p1).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.overrallRating})</option>
                  ))}
                </select>
              </div>
              <Button variant="primary" type="submit" loading={isLoading}>Compare</Button>
            </div>
          </form>

          {error && <ErrorNote error={error} />}
          {isLoading && <Loading className="py-10" />}
          {data && query && (
            <H2HResult data={data as MatchHistoryDto} p1Name={nameOf(query.p1)} p2Name={nameOf(query.p2)} />
          )}
          {query && !isLoading && <MatchDetailList p1Id={query.p1} p2Id={query.p2} />}
        </div>

        <aside className="panel overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h2 className="panel-title">Top rivalries</h2>
            <p className="text-sm text-chalk-faint mt-1.5">Select one to open the full head to head.</p>
          </div>
          {rivalriesLoading && <Loading className="py-8" />}
          {rivalries && (
            <div className="px-1.5 pb-2">
              {(rivalries as Rivalry[]).length === 0 && <Empty title="No rivalries yet" className="py-6" />}
              {(rivalries as Rivalry[]).map((r, i) => (
                <div key={i} className={cn(i > 4 && 'opacity-60')}>
                  <RivalryCard r={r} onSelect={handleRivalrySelect} />
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
