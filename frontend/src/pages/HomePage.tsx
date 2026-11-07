import { Link } from 'react-router-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import { ArrowRight, Goal, Trophy, Plus } from 'lucide-react'
import { championshipsApi } from '../api/championships'
import { playersApi } from '../api/players'
import type { Championship, ChampionshipBrief, FormEntry, Match } from '../types'
import { cn, fmtCupFull, fmtDate, fmtPhase } from '../lib/utils'
import { formPoints, latestFirst } from '../lib/stats'
import RankNumber from '../components/ui/RankNumber'
import PlayerLink from '../components/ui/PlayerLink'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

const RESULT_CHIP: Record<string, string> = {
  W: 'bg-win text-turf-bg',
  D: 'bg-draw text-turf-bg',
  L: 'bg-loss text-turf-bg',
}

function SectionHead({ title, to, linkLabel }: { title: string; to?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 sm:px-6 pt-5 pb-4">
      <h2 className="panel-title">{title}</h2>
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-chalk-muted hover:text-gold transition-colors">
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}

/** Score read from `firstId`'s side, e.g. "3–1 (5–4 on pens)". */
function scoreline(m: Match, firstId?: string) {
  const [x, y] = m.participants
  const [a, b] = firstId && y?.id === firstId ? [y, x] : [x, y]
  const pens =
    (a?.penaltyShootoutGoals ?? 0) > 0 || (b?.penaltyShootoutGoals ?? 0) > 0
      ? ` (${a?.penaltyShootoutGoals ?? 0}–${b?.penaltyShootoutGoals ?? 0} on pens)`
      : ''
  return `${a?.goals ?? 0}–${b?.goals ?? 0}${pens}`
}

// ── Hero: the latest champion ────────────────────────────────────────────────

function ChampionHero({ brief, detail }: { brief: ChampionshipBrief; detail?: Championship }) {
  const final = detail?.matches.find(m => m.matchPhase === 'FINALS')
  const winnerId = detail?.championshipWinner?.id ?? final?.winnerId ?? undefined
  const loser = final?.participants.find(p => p.id !== winnerId)
  const winnerName = detail?.championshipWinner?.name ?? brief.winnerName ?? ''

  return (
    <section className="relative overflow-hidden panel border-gold/30 mb-4">
      {/* Centre-circle marking, as on a pitch */}
      <svg
        viewBox="0 0 400 400"
        aria-hidden="true"
        className="absolute -right-24 -top-24 w-[26rem] h-[26rem] text-gold/[0.09] pointer-events-none"
      >
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="6" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="6" />
        <circle cx="200" cy="200" r="12" fill="currentColor" />
      </svg>

      <div className="relative px-6 sm:px-10 py-8 sm:py-10 bg-[linear-gradient(120deg,rgba(242,193,78,0.10),transparent_55%)]">
        <p className="flex items-center gap-2 text-sm font-semibold text-gold">
          <Trophy className="w-4 h-4" />
          {fmtCupFull(brief.title)} champion
        </p>

        <h1 className="font-display font-black leading-[0.8] tracking-[-0.015em] text-chalk text-7xl sm:text-[9rem] mt-4 break-words">
          {winnerId ? <PlayerLink id={winnerId} name={winnerName} className="hover:no-underline" /> : winnerName}
        </h1>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-chalk-muted">
          {final && loser ? (
            <>
              Beat <span className="font-semibold text-chalk">{loser.name}</span>{' '}
              <span className="font-semibold text-chalk tabular-nums">{scoreline(final, winnerId)}</span> in the final on{' '}
              {fmtDate(brief.createdAtIso)}.
            </>
          ) : (
            <>Won on {fmtDate(brief.createdAtIso)}.</>
          )}
          {detail?.goldenBootWinner && (
            <>
              {' '}
              <span className="inline-flex items-center gap-1 align-baseline">
                <Goal className="w-3.5 h-3.5 self-center" />
                {detail.goldenBootWinner.name}
              </span>{' '}
              took the golden boot with {detail.goldenBootWinner.goals}.
            </>
          )}
        </p>

        <Link
          to={`/championships/${brief.id}`}
          className="inline-flex items-center gap-1.5 mt-6 h-10 px-4 rounded-lg bg-gold text-turf-bg text-sm font-semibold hover:bg-[#F7CF6B] transition-colors"
        >
          See the cup <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: briefs, isLoading, error } = useQuery({
    queryKey: ['championships'],
    queryFn: championshipsApi.list,
  })
  const { data: rankings } = useQuery({ queryKey: ['rankings'], queryFn: playersApi.rankings })
  const { data: players = [] } = useQuery({ queryKey: ['players-all'], queryFn: playersApi.all })

  const sorted = [...(briefs ?? [])].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso))
  const latestChampion = sorted.find(c => c.winnerName)
  const inProgress = sorted.filter(c => !c.winnerName)
  const latest = sorted[0]

  const { data: championDetail } = useQuery({
    queryKey: ['championship', latestChampion?.id],
    queryFn: () => championshipsApi.get(latestChampion!.id),
    enabled: !!latestChampion,
  })
  const { data: latestDetail } = useQuery({
    queryKey: ['championship', latest?.id],
    queryFn: () => championshipsApi.get(latest!.id),
    enabled: !!latest,
  })

  // In form: points from each player's last five
  const forms = useQueries({
    queries: players.map(p => ({
      queryKey: ['form', p.id],
      queryFn: () => playersApi.form(p.id),
      staleTime: 60_000,
    })),
  })
  const inForm = players
    .map((p, i) => ({ p, entries: (forms[i]?.data as FormEntry[] | undefined) ?? [] }))
    .filter(x => x.entries.length > 0)
    .map(x => ({ ...x, points: formPoints(x.entries) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)

  if (isLoading) return <Loading />
  if (error) return <ErrorNote error={error} />

  if (!sorted.length) {
    return (
      <div className="panel">
        <Empty
          title="No cups played yet"
          hint={
            <Link to="/championships" className="inline-flex items-center gap-1 text-gold hover:underline mt-1">
              <Plus className="w-3.5 h-3.5" /> Create the first championship
            </Link>
          }
          className="py-24"
        />
      </div>
    )
  }

  const recent = latestDetail ? latestFirst(latestDetail.matches).slice(0, 6) : []

  return (
    <>
      {latestChampion ? (
        <ChampionHero brief={latestChampion} detail={championDetail} />
      ) : (
        <section className="panel px-6 sm:px-10 py-10 mb-4">
          <h1 className="font-display text-6xl sm:text-7xl font-black leading-[0.85] text-chalk">No champion yet</h1>
          <p className="mt-3 text-chalk-muted">The first cup is still being played.</p>
        </section>
      )}

      {inProgress.length > 0 && (
        <section className="mb-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inProgress.map(c => (
              <Link
                key={c.id}
                to={`/championships/${c.id}`}
                className="panel group flex items-center justify-between gap-4 px-5 py-4 hover:border-chalk-faint transition-colors"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold text-win">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-win animate-ping opacity-60" />
                      <span className="relative w-2 h-2 rounded-full bg-win" />
                    </span>
                    In progress
                  </p>
                  <p className="font-display text-2xl font-extrabold text-chalk truncate mt-1">{fmtCupFull(c.title)}</p>
                  <p className="text-xs text-chalk-faint tabular-nums">
                    {c.matchCount} {c.matchCount === 1 ? 'match' : 'matches'} played
                    {c.isDuo && <span className="ml-2 text-lower">Duo</span>}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-chalk-faint group-hover:text-gold transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr,1fr] gap-4 items-start">
        {/* Latest results */}
        <section className="panel overflow-hidden">
          {latest && (
            <SectionHead
              title={`Latest from ${fmtCupFull(latest.title)}`}
              to={`/championships/${latest.id}`}
              linkLabel="All results"
            />
          )}
          {!latestDetail ? (
            <Loading className="py-10" />
          ) : recent.length === 0 ? (
            <Empty title="No matches yet" className="py-8" />
          ) : (
            <ol className="divide-y divide-turf-line/60 border-t border-turf-line">
              {recent.map(m => {
                const [a, b] = m.participants
                const aWins = !!m.winnerId && m.winnerId === a?.id
                const bWins = !!m.winnerId && m.winnerId === b?.id
                const pens = (a?.penaltyShootoutGoals ?? 0) > 0 || (b?.penaltyShootoutGoals ?? 0) > 0
                return (
                  <li key={m.id} className="px-5 sm:px-6 py-3">
                    <p className="text-xs text-chalk-faint mb-1">{fmtPhase(m.matchPhase)}</p>
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                      <span className={cn('text-right font-semibold truncate', aWins ? 'text-chalk' : 'text-chalk-faint')}>
                        {a?.name}
                      </span>
                      <span className="font-display text-3xl font-black tabular-nums leading-none text-chalk text-center min-w-[4.5rem]">
                        {a?.goals ?? 0}
                        <span className="text-chalk-faint text-xl mx-1">–</span>
                        {b?.goals ?? 0}
                      </span>
                      <span className={cn('font-semibold truncate', bWins ? 'text-chalk' : 'text-chalk-faint')}>
                        {b?.name}
                      </span>
                    </div>
                    {pens && (
                      <p className="text-[11px] text-chalk-faint text-center tabular-nums mt-1">
                        {a?.penaltyShootoutGoals ?? 0}–{b?.penaltyShootoutGoals ?? 0} on pens
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <div className="space-y-4">
          {/* The table */}
          <section className="panel overflow-hidden">
            <SectionHead title="The table" to="/rankings" linkLabel="Full rankings" />
            {!rankings ? (
              <Loading className="py-8" />
            ) : rankings.length === 0 ? (
              <Empty title="Nobody ranked yet" className="py-6" />
            ) : (
              <ol className="divide-y divide-turf-line/60 border-t border-turf-line">
                {rankings.slice(0, 5).map(r => (
                  <li key={r.playerId} className="grid grid-cols-[2.25rem,1fr,auto] items-center gap-3 px-5 sm:px-6 py-2.5">
                    <RankNumber rank={r.rank} className="text-2xl" />
                    <PlayerLink id={r.playerId} name={r.playerName} className="font-semibold text-chalk truncate" />
                    <span className="font-display text-xl font-extrabold tabular-nums text-chalk">{r.rankingScore}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* In form */}
          {inForm.length > 0 && (
            <section className="panel overflow-hidden">
              <SectionHead title="In form" />
              <ol className="divide-y divide-turf-line/60 border-t border-turf-line">
                {inForm.map(({ p, entries, points }) => (
                  <li key={p.id} className="grid grid-cols-[1fr,auto,auto] items-center gap-3 px-5 sm:px-6 py-2.5">
                    <PlayerLink id={p.id} name={p.name} className="font-semibold text-chalk truncate" />
                    <span className="flex gap-1">
                      {entries.slice(0, 5).map((e, i) => {
                        const key = e.decidedByPenalties ? 'D' : e.result
                        return (
                          <span
                            key={i}
                            className={cn('inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold', RESULT_CHIP[key])}
                          >
                            {key}
                          </span>
                        )
                      })}
                    </span>
                    <span className="text-sm tabular-nums text-chalk-muted w-12 text-right">
                      <span className="font-semibold text-chalk">{points}</span> pts
                    </span>
                  </li>
                ))}
              </ol>
              <p className="px-5 sm:px-6 py-3 text-xs text-chalk-faint border-t border-turf-line">
                Points from the last five matches: 3 for a win, 1 for a draw or shootout.
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
