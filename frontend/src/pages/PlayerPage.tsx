import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Trophy, Goal, Swords } from 'lucide-react'
import { playersApi } from '../api/players'
import { championshipsApi } from '../api/championships'
import type { FormEntry, PlayerSummaryCup, PlayerSummaryOpponent } from '../types'
import { cn, fmtCup, fmtCupFull, fmtDate, fmtFinish, fmtPhase, ratingTone } from '../lib/utils'
import RadarChart from '../components/ui/RadarChart'
import RatingBar from '../components/ui/RatingBar'
import RatingChart from '../components/RatingChart'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

// ── Small pieces ─────────────────────────────────────────────────────────────

const RESULT_CHIP: Record<string, string> = {
  W: 'bg-win text-turf-bg',
  D: 'bg-draw text-turf-bg',
  L: 'bg-loss text-turf-bg',
}

function Panel({
  title,
  aside,
  children,
  className,
}: {
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('panel overflow-hidden', className)}>
      <div className="flex items-baseline justify-between gap-4 px-5 sm:px-6 pt-5 pb-4">
        <h2 className="panel-title">{title}</h2>
        {aside && <div className="text-sm text-chalk-faint">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

function Figure({ value, label, tone }: { value: React.ReactNode; label: string; tone?: string }) {
  return (
    <div className="px-4 sm:px-5 py-4">
      <div className={cn('font-display text-4xl font-extrabold leading-none tabular-nums text-chalk', tone)}>{value}</div>
      <div className="text-xs text-chalk-muted mt-1.5">{label}</div>
    </div>
  )
}

// ── Opponents ────────────────────────────────────────────────────────────────

type OpponentRecord = PlayerSummaryOpponent

function OpponentCallout({
  kind,
  rec,
  playerId,
}: {
  kind: 'victim' | 'bogey'
  rec: OpponentRecord
  playerId: string
}) {
  const victim = kind === 'victim'
  return (
    <Link
      to={`/h2h?p1=${playerId}&p2=${rec.opponentId}`}
      className={cn(
        'block rounded-xl border px-4 py-3.5 transition-colors',
        victim ? 'border-win/30 bg-win/[0.06] hover:border-win/60' : 'border-loss/30 bg-loss/[0.06] hover:border-loss/60',
      )}
    >
      <p className={cn('text-xs font-semibold', victim ? 'text-win' : 'text-loss')}>
        {victim ? 'Favourite opponent' : 'Toughest opponent'}
      </p>
      <p className="font-display text-3xl font-extrabold leading-tight text-chalk truncate mt-0.5">{rec.opponentName}</p>
      <p className="text-sm text-chalk-muted tabular-nums">
        Won {rec.wins} of {rec.matchesPlayed}, lost {rec.losses}
      </p>
    </Link>
  )
}

function OpponentsTable({ records, playerId }: { records: OpponentRecord[]; playerId: string }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-turf-line text-chalk-faint">
            <th className="px-5 sm:px-6 py-2.5 text-left text-xs font-semibold">Opponent</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold">Played</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold">Won, drawn, lost</th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold">Goals</th>
            <th className="px-5 sm:px-6 py-2.5 text-right text-xs font-semibold">Win rate</th>
          </tr>
        </thead>
        <tbody>
          {records.map(h => {
            const total = h.matchesPlayed || 1
            const wr = Math.round((h.wins / total) * 100)
            return (
              <tr key={h.opponentId} className="border-b border-turf-line/60 last:border-0 hover:bg-turf-raised/50 transition-colors">
                <td className="px-5 sm:px-6 py-3">
                  <Link
                    to={`/h2h?p1=${playerId}&p2=${h.opponentId}`}
                    className="font-semibold text-chalk hover:text-gold transition-colors"
                  >
                    {h.opponentName}
                  </Link>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-chalk-muted">{h.matchesPlayed}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums whitespace-nowrap w-16">
                      <span className="text-win font-semibold">{h.wins}</span>
                      <span className="text-chalk-faint"> · </span>
                      <span className="text-draw font-semibold">{h.draws}</span>
                      <span className="text-chalk-faint"> · </span>
                      <span className="text-loss font-semibold">{h.losses}</span>
                    </span>
                    <div className="hidden sm:flex h-1.5 w-28 rounded-full overflow-hidden gap-px bg-turf-line" aria-hidden="true">
                      <div className="bg-win" style={{ width: `${(h.wins / total) * 100}%` }} />
                      <div className="bg-draw" style={{ width: `${(h.draws / total) * 100}%` }} />
                      <div className="bg-loss" style={{ width: `${(h.losses / total) * 100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-chalk-muted whitespace-nowrap">
                  {h.goalsFor}–{h.goalsAgainst}
                </td>
                <td className="px-5 sm:px-6 py-3 text-right">
                  <span
                    className={cn(
                      'font-display text-xl font-bold tabular-nums',
                      h.wins > h.losses ? 'text-win' : h.wins < h.losses ? 'text-loss' : 'text-chalk',
                    )}
                  >
                    {wr}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Cup history ──────────────────────────────────────────────────────────────

function CupHistory({ runs }: { runs: PlayerSummaryCup[] }) {
  return (
    <ol className="divide-y divide-turf-line/60 border-t border-turf-line">
      {runs.map(r => {
        const champ = r.finish === 'CHAMPION'
        return (
          <li key={r.championshipId}>
            <Link
              to={`/championships/${r.championshipId}`}
              className="grid grid-cols-[1fr,auto] sm:grid-cols-[7.5rem,1fr,auto] items-center gap-x-4 gap-y-0.5 px-5 sm:px-6 py-3.5 hover:bg-turf-raised/50 transition-colors"
            >
              <span className="text-sm text-chalk-faint tabular-nums sm:order-none order-last col-span-2 sm:col-span-1">
                {fmtDate(r.createdAtIso)}
              </span>
              <span className="min-w-0">
                <span className="font-display text-xl font-bold text-chalk">{fmtCupFull(r.title)}</span>
                {r.isDuo && <span className="ml-2 text-xs font-medium text-lower">Duo</span>}
                {r.goldenBoot && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                    <Goal className="w-3.5 h-3.5" /> Golden boot
                  </span>
                )}
              </span>
              <span className="text-right">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    champ ? 'text-gold' : r.finish === 'RUNNER_UP' || r.finish === 'FINALIST' ? 'text-silver' : 'text-chalk-muted',
                  )}
                >
                  {champ && <Trophy className="w-4 h-4" />}
                  {fmtFinish(r.finish, r.phase)}
                </span>
                <span className="block text-xs text-chalk-faint tabular-nums">
                  {r.matchesPlayed} {r.matchesPlayed === 1 ? 'match' : 'matches'}, {r.goals} {r.goals === 1 ? 'goal' : 'goals'}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PlayerPage() {
  const { id = '' } = useParams()

  const { data: players = [], isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players-all'],
    queryFn: playersApi.all,
  })
  const player = players.find(p => p.id === id)

  const { data: rankings } = useQuery({ queryKey: ['rankings'], queryFn: playersApi.rankings })
  const ranking = rankings?.find(r => r.playerId === id)

  const { data: retro } = useQuery({
    queryKey: ['retrospect', id],
    queryFn: () => playersApi.retrospect(id),
    enabled: !!player,
  })

  const { data: form } = useQuery({
    queryKey: ['form', id],
    queryFn: () => playersApi.form(id),
    enabled: !!player,
    staleTime: 60_000,
  })

  const { data: winners } = useQuery({ queryKey: ['winners'], queryFn: championshipsApi.winners })
  const titles = winners?.find(w => w.playerId === id)
  const titleCount = titles?.championships.reduce((s, c) => s + c.timesWon, 0) ?? 0

  const { data: ratingHistory } = useQuery({
    queryKey: ['rating-history', id],
    queryFn: () => playersApi.ratingHistory(id),
    enabled: !!player,
  })

  // Cup history, finals record and opponents come from one request
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['player-summary', id],
    queryFn: () => playersApi.summary(id),
    enabled: !!player,
  })
  const records = summary?.opponents ?? []
  const runs = summary?.cups ?? []

  const { victim, bogey } = useMemo(() => {
    const eligible = records.filter(r => r.matchesPlayed >= 3)
    if (eligible.length < 2) return { victim: undefined, bogey: undefined }
    const score = (r: OpponentRecord) => (r.wins - r.losses) / r.matchesPlayed
    const sorted = [...eligible].sort((a, b) => score(b) - score(a) || b.matchesPlayed - a.matchesPlayed)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    return {
      victim: score(best) > 0 ? best : undefined,
      bogey: score(worst) < 0 ? worst : undefined,
    }
  }, [records])

  if (playersLoading) return <Loading />
  if (playersError) return <ErrorNote error={playersError} />
  if (!player)
    return (
      <div className="panel">
        <Empty
          title="Player not found"
          hint={<Link to="/players" className="text-gold hover:underline">Go back to all players</Link>}
        />
      </div>
    )

  const axes = [
    { label: 'Attack', value: player.attack },
    { label: 'Defense', value: player.defense },
    { label: 'Intelligence', value: player.intelligence },
    { label: 'Mentality', value: player.mentality },
    { label: 'Overall', value: player.overrallRating },
  ]

  const formEntries = (form as FormEntry[] | undefined) ?? []

  return (
    <>
      <Link
        to="/players"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-chalk-muted hover:text-chalk transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> All players
      </Link>

      {/* ── Header ── */}
      <header className="grid grid-cols-[1fr,auto] items-end gap-6 mb-8">
        <div className="min-w-0">
          <h1 className="font-display text-6xl sm:text-8xl font-black leading-[0.82] tracking-[-0.01em] text-chalk break-words">
            {player.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {ranking && (
              <Link
                to="/rankings"
                className="inline-flex items-center gap-1.5 rounded-md border border-turf-line bg-turf-surface px-2.5 py-1 text-sm text-chalk-muted hover:text-chalk"
              >
                Ranked <span className="font-bold text-chalk tabular-nums">#{ranking.rank}</span>
                {rankings && <span className="text-chalk-faint">of {rankings.length}</span>}
              </Link>
            )}
            {titleCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gold/35 bg-gold/[0.08] px-2.5 py-1 text-sm font-semibold text-gold">
                <Trophy className="w-3.5 h-3.5" />
                {titleCount} {titleCount === 1 ? 'title' : 'titles'}
              </span>
            )}
            <Link
              to={`/h2h?p1=${player.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-turf-line px-2.5 py-1 text-sm text-chalk-muted hover:text-chalk"
            >
              <Swords className="w-3.5 h-3.5" /> Compare
            </Link>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('font-display text-7xl sm:text-9xl font-black leading-[0.8] tabular-nums', ratingTone(player.overrallRating))}>
            {player.overrallRating}
          </p>
          <p className="text-sm text-chalk-muted mt-2">Overall</p>
        </div>
      </header>

      {/* ── Career numbers ── */}
      {retro && (
        <section className="panel grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-turf-line [&>*]:border-turf-line [&>*]:border-b lg:[&>*]:border-b-0 [&>*:not(:last-child)]:border-r mb-4">
          <Figure value={retro.totalMatches} label="Matches" />
          <Figure value={retro.totalWins} label="Won" tone="text-win" />
          <Figure value={retro.totalDraws} label="Drawn" tone="text-draw" />
          <Figure value={retro.totalLosses} label="Lost" tone="text-loss" />
          <Figure value={`${retro.winRate}%`} label="Win rate" tone="text-gold" />
          <Figure value={retro.totalGoals} label="Goals" />
          <Figure value={retro.averageGoalsPerMatch} label="Goals per match" />
          <Figure value={ranking?.rankingScore ?? '–'} label="Ranking score" />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.15fr] gap-4 mb-4">
        {/* ── Attributes ── */}
        <Panel title="Attributes">
          <div className="grid sm:grid-cols-[auto,1fr] items-center gap-4 px-5 sm:px-6 pb-6">
            <div className="flex justify-center">
              <RadarChart axes={axes} size={190} />
            </div>
            <dl className="space-y-3">
              {axes.slice(0, 4).map(a => (
                <div key={a.label}>
                  <dt className="text-xs text-chalk-muted mb-1">{a.label}</dt>
                  <dd><RatingBar value={a.value} /></dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>

        {/* ── Recent form ── */}
        <Panel title="Last five" aside="Most recent first">
          {formEntries.length === 0 ? (
            <Empty title="No matches yet" className="py-8" />
          ) : (
            <ol className="divide-y divide-turf-line/60 border-t border-turf-line">
              {formEntries.map((e, i) => {
                const key = e.decidedByPenalties ? 'D' : e.result
                return (
                  <li key={i} className="grid grid-cols-[2rem,3.5rem,1fr] items-center gap-3 px-5 sm:px-6 py-3">
                    <span className={cn('inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold', RESULT_CHIP[key])}>
                      {key}
                    </span>
                    <span className="font-display text-2xl font-extrabold tabular-nums text-chalk leading-none">
                      {e.goalsFor}–{e.goalsAgainst}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-chalk truncate">
                        vs {e.opponentName}
                        {e.decidedByPenalties && (
                          <span className={cn('ml-2 text-xs font-medium', e.result === 'W' ? 'text-win' : 'text-loss')}>
                            {e.result === 'W' ? 'won on pens' : 'lost on pens'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-chalk-faint truncate">
                        {fmtCup(e.championship)}, {fmtPhase(e.phase)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </Panel>
      </div>

      {/* ── Rating history ── */}
      <Panel
        title="Rating over time"
        aside={ratingHistory && ratingHistory.snapshots.length > 0 ? 'Overall after each cup' : undefined}
        className="mb-4"
      >
        <div className="px-5 sm:px-6 pb-5">
          {!ratingHistory ? (
            <Loading className="py-8" />
          ) : ratingHistory.snapshots.length === 0 ? (
            <p className="text-sm text-chalk-muted">
              No ratings saved after a cup yet. They're saved from the latest cup's page after ratings are updated.
            </p>
          ) : (
            <RatingChart snapshots={ratingHistory.snapshots} current={ratingHistory.current.overall} />
          )}
        </div>
      </Panel>

      {/* ── Trophy cabinet ── */}
      <Panel title="Trophy cabinet" className="mb-4">
        <div className="px-5 sm:px-6 pb-6">
          {titleCount === 0 ? (
            <p className="text-sm text-chalk-muted">No titles yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {titles!.championships.map(c => (
                <div
                  key={c.championshipName}
                  className="min-w-[8.5rem] rounded-xl border border-gold/30 bg-[linear-gradient(160deg,rgba(242,193,78,0.10),transparent_60%)] px-4 py-3"
                >
                  <Trophy className="w-5 h-5 text-gold" />
                  <p className="font-display text-xl font-bold text-chalk mt-2 leading-none">{fmtCupFull(c.championshipName)}</p>
                  <p className="font-display text-4xl font-black text-gold tabular-nums leading-none mt-1">×{c.timesWon}</p>
                </div>
              ))}
            </div>
          )}

          {summary && runs.length > 0 && (
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mt-6 pt-5 border-t border-turf-line">
              <div>
                <dt className="text-xs text-chalk-muted">Finals</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums text-chalk leading-tight">
                  {summary.finalsWon}
                  <span className="text-chalk-faint text-xl"> won of {summary.finalsPlayed}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-chalk-muted">Cups entered</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums text-chalk leading-tight">{summary.cupsEntered}</dd>
              </div>
              <div>
                <dt className="text-xs text-chalk-muted">Golden boots</dt>
                <dd className="font-display text-3xl font-extrabold tabular-nums text-chalk leading-tight">{summary.goldenBoots}</dd>
              </div>
              <div>
                <dt className="text-xs text-chalk-muted">Best finish</dt>
                <dd className={cn('font-display text-3xl font-extrabold leading-tight', summary.bestFinish?.finish === 'CHAMPION' ? 'text-gold' : 'text-chalk')}>
                  {summary.bestFinish ? fmtFinish(summary.bestFinish.finish, summary.bestFinish.phase) : '–'}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </Panel>

      {/* ── Opponents ── */}
      <Panel
        title="Against everyone"
        aside={records.length > 0 ? `${records.length} opponents` : undefined}
        className="mb-4"
      >
        {summaryLoading ? (
          <Loading className="py-10" />
        ) : records.length === 0 ? (
          <Empty title="No opponents yet" className="py-8" />
        ) : (
          <>
            {(victim || bogey) && (
              <div className="grid sm:grid-cols-2 gap-3 px-5 sm:px-6 pb-5">
                {victim && <OpponentCallout kind="victim" rec={victim} playerId={player.id} />}
                {bogey && <OpponentCallout kind="bogey" rec={bogey} playerId={player.id} />}
              </div>
            )}
            <OpponentsTable records={records} playerId={player.id} />
          </>
        )}
      </Panel>

      {/* ── Cup history ── */}
      <Panel title="Cup history" aside={runs.length > 0 ? `${runs.length} cups` : undefined}>
        {summaryLoading ? (
          <Loading className="py-10" />
        ) : runs.length === 0 ? (
          <Empty title="Hasn't played a cup yet" className="py-8" />
        ) : (
          <CupHistory runs={runs} />
        )}
      </Panel>
    </>
  )
}
