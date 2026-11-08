import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Plus, ChevronDown, Trophy, Goal, Users, Pencil, Trash2 } from 'lucide-react'
import { championshipsApi, type CreateMatchData } from '../api/championships'
import { playersApi } from '../api/players'
import type { Championship, ChampionshipBrief, ChampionshipGroup, Match, Player, RatingPoint } from '../types'
import { cn, fmtDate, fmtPhase, fmtDuo, fmtCup, fmtCupFull, ALL_PHASES, TOURNAMENT_NAMES } from '../lib/utils'
import Button from '../components/ui/Button'
import Dialog from '../components/ui/Dialog'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BracketView from '../components/BracketView'
import RatingChanges from '../components/RatingChanges'
import PageHeader from '../components/ui/PageHeader'
import { Empty, ErrorNote, Loading } from '../components/ui/States'

// ── Create Championship Form ─────────────────────────────────────────────────

function CreateChampionshipForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void
  onSuccess: () => void
}) {
  const [title, setTitle] = useState<string>(TOURNAMENT_NAMES[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const qc = useQueryClient()

  const mut = useMutation({
    mutationFn: championshipsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['championships'] })
      toast.success('Championship created')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        mut.mutate({ title, createdAtIso: date })
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="champ-title" className="field-label">Cup</label>
        <select id="champ-title" value={title} onChange={e => setTitle(e.target.value)} className="field">
          {TOURNAMENT_NAMES.map(t => <option key={t} value={t}>{fmtCup(t)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="champ-date" className="field-label">Date</label>
        <input id="champ-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="field" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={mut.isPending}>Create championship</Button>
      </div>
    </form>
  )
}

// ── Match form (add or edit) ─────────────────────────────────────────────────

function MatchForm({
  championship: c,
  match,
  onCancel,
  onSuccess,
  onDelete,
}: {
  championship: Championship
  /** Set when editing an existing match */
  match?: Match
  onCancel: () => void
  onSuccess: () => void
  /** Editing only: asks to delete this match */
  onDelete?: () => void
}) {
  const editing = !!match
  const [first, second] = match?.participants ?? []
  const [phase, setPhase] = useState(match?.matchPhase ?? ALL_PHASES[0])
  const [groupId, setGroupId] = useState('')
  const [p1Id, setP1Id] = useState(first?.id ?? '')
  const [p1Goals, setP1Goals] = useState(first?.goals ?? 0)
  const [p1Pen, setP1Pen] = useState(first?.penaltyShootoutGoals ?? 0)
  const [p2Id, setP2Id] = useState(second?.id ?? '')
  const [p2Goals, setP2Goals] = useState(second?.goals ?? 0)
  const [p2Pen, setP2Pen] = useState(second?.penaltyShootoutGoals ?? 0)
  const groups = c.groups ?? []

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players-all'],
    queryFn: playersApi.all,
    enabled: !c.isDuo,
  })

  // Duo cups are played between duos, whose ids are the cup's participants
  const options: { id: string; label: string }[] = c.isDuo
    ? c.players.map(d => ({ id: d.id, label: d.name }))
    : (allPlayers as Player[]).map(p => ({ id: p.id, label: `${p.name} (${p.overrallRating})` }))

  const mut = useMutation({
    mutationFn: (data: CreateMatchData) =>
      editing
        ? championshipsApi.updateMatch(c.id, match.id, data)
        : championshipsApi.createMatch(c.id, data),
    onSuccess: () => {
      toast.success(editing ? 'Match updated' : 'Match added')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const who = c.isDuo ? 'duos' : 'players'
    if (!p1Id || !p2Id) { toast.error(`Choose both ${who}`); return }
    if (p1Id === p2Id) { toast.error(`Pick two different ${who}`); return }
    mut.mutate({
      matchPhase: phase,
      groupId: phase === 'GROUP_STAGE' ? groupId || undefined : undefined,
      participants: [
        { id: p1Id, goals: p1Goals, penaltyShootoutGoals: p1Pen || undefined },
        { id: p2Id, goals: p2Goals, penaltyShootoutGoals: p2Pen || undefined },
      ],
    })
  }

  const scoreCls =
    'w-full h-16 rounded-lg border border-turf-line bg-turf-bg text-center font-display text-4xl font-black tabular-nums text-chalk focus:outline-none focus:border-gold/70 focus:ring-2 focus:ring-gold/20'
  const penCls =
    'w-full h-8 rounded-md border border-turf-line bg-turf-bg text-center text-sm tabular-nums text-chalk-muted focus:outline-none focus:border-gold/70'

  const sides = [
    { key: 'home', id: p1Id, setId: setP1Id, goals: p1Goals, setGoals: setP1Goals, pen: p1Pen, setPen: setP1Pen },
    { key: 'away', id: p2Id, setId: setP2Id, goals: p2Goals, setGoals: setP2Goals, pen: p2Pen, setPen: setP2Pen },
  ] as const

  const showGroup = groups.length > 0 && phase === 'GROUP_STAGE' && !editing

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className={cn('grid gap-3', showGroup && 'grid-cols-2')}>
        <div>
          <label htmlFor="match-phase" className="field-label">Phase</label>
          <select id="match-phase" value={phase} onChange={e => setPhase(e.target.value)} className="field">
            {ALL_PHASES.map(p => <option key={p} value={p}>{fmtPhase(p)}</option>)}
          </select>
        </div>
        {showGroup && (
          <div>
            <label htmlFor="match-group" className="field-label">Group</label>
            <select id="match-group" value={groupId} onChange={e => setGroupId(e.target.value)} className="field">
              <option value="">Their current group</option>
              {groups.map((g, i) => (
                <option key={g.id} value={g.id}>Group {String.fromCharCode(65 + i)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Scoreboard-style entry */}
      <div className="rounded-xl border border-turf-line bg-turf-raised/40 p-4">
        <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-start">
          {sides.map(({ key, id, setId, goals, setGoals, pen, setPen }, i) => (
            <div key={key} className={cn('space-y-2', i === 1 && 'col-start-3')}>
              <label htmlFor={`match-${key}`} className="sr-only">{c.isDuo ? 'Duo' : 'Player'} {i + 1}</label>
              <select id={`match-${key}`} value={id} onChange={e => setId(e.target.value)} className="field">
                <option value="">{c.isDuo ? 'Select duo' : 'Select player'}</option>
                {options.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <label htmlFor={`goals-${key}`} className="sr-only">Goals</label>
              <input
                id={`goals-${key}`}
                type="number"
                min={0}
                value={goals}
                onChange={e => setGoals(Number(e.target.value))}
                className={scoreCls}
              />
              <div className="flex items-center gap-2">
                <label htmlFor={`pens-${key}`} className="text-xs text-chalk-faint shrink-0">Pens</label>
                <input
                  id={`pens-${key}`}
                  type="number"
                  min={0}
                  value={pen}
                  onChange={e => setPen(Number(e.target.value))}
                  className={penCls}
                />
              </div>
            </div>
          ))}
          <span className="col-start-2 row-start-1 self-center mt-12 font-display text-2xl font-bold text-chalk-faint">
            –
          </span>
        </div>
        <p className="text-xs text-chalk-faint mt-3">Only fill in penalties if the match went to a shootout.</p>
      </div>

      {c.isDuo && options.length === 0 && (
        <p className="text-sm text-gold">Add the cup's duos first, then record their matches.</p>
      )}

      <div className="flex items-center gap-2">
        {editing && onDelete && (
          <Button variant="danger" type="button" onClick={onDelete} className="mr-auto">
            <Trash2 className="w-4 h-4" /> Delete match
          </Button>
        )}
        <Button variant="ghost" type="button" onClick={onCancel} className={cn(!editing && 'ml-auto')}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={mut.isPending}>
          {editing ? 'Save changes' : 'Add match'}
        </Button>
      </div>
    </form>
  )
}

// ── Add Duo Form ─────────────────────────────────────────────────────────────

function AddDuoForm({
  champId,
  onCancel,
  onSuccess,
}: {
  champId: string
  onCancel: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [p1Id, setP1Id] = useState('')
  const [p2Id, setP2Id] = useState('')

  const mut = useMutation({
    mutationFn: () =>
      championshipsApi.createDuo(champId, {
        player1Id: p1Id.trim(),
        player2Id: p2Id.trim(),
        name: name.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Duo added')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (!p1Id.trim() || !p2Id.trim()) { toast.error('Both player IDs are required'); return }
        mut.mutate()
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="duo-name" className="field-label">Duo name (optional)</label>
        <input id="duo-name" value={name} onChange={e => setName(e.target.value)} placeholder="The Untouchables" className="field" />
      </div>
      <div>
        <label htmlFor="duo-p1" className="field-label">First player ID</label>
        <input id="duo-p1" value={p1Id} onChange={e => setP1Id(e.target.value)} placeholder="Paste from the Players page" className="field" />
      </div>
      <div>
        <label htmlFor="duo-p2" className="field-label">Second player ID</label>
        <input id="duo-p2" value={p2Id} onChange={e => setP2Id(e.target.value)} placeholder="Paste from the Players page" className="field" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={mut.isPending}>Add duo</Button>
      </div>
    </form>
  )
}

// ── Match view tabs (bracket + list) ────────────────────────────────────────

function MatchViewTabs({
  title,
  matches,
  matchesByPhase,
  onEdit,
}: {
  title: string
  matches: Championship['matches']
  matchesByPhase: Record<string, Championship['matches']>
  onEdit: (match: Match) => void
}) {
  const [tab, setTab] = useState<'bracket' | 'list'>('bracket')

  const tabCls = (active: boolean) =>
    cn(
      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
      active ? 'bg-turf-raised text-chalk' : 'text-chalk-faint hover:text-chalk',
    )

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-turf-line">
        <div className="flex items-baseline gap-3">
          <h3 className="panel-title">Matches</h3>
          <span className="text-sm text-chalk-faint tabular-nums">{matches.length}</span>
        </div>
        <div className="flex gap-1 p-1 rounded-lg border border-turf-line" role="tablist">
          <button role="tab" aria-selected={tab === 'bracket'} className={tabCls(tab === 'bracket')} onClick={() => setTab('bracket')}>
            Bracket
          </button>
          <button role="tab" aria-selected={tab === 'list'} className={tabCls(tab === 'list')} onClick={() => setTab('list')}>
            List
          </button>
        </div>
      </div>

      <div className="p-5">
        {matches.length === 0 ? (
          <Empty title="No matches yet" hint="Use “Add match” to record the first result." />
        ) : tab === 'bracket' ? (
          <BracketView matches={matches} onSelect={onEdit} title={title} />
        ) : (
          <div className="space-y-6">
            {Object.entries(matchesByPhase).map(([phase, phaseMatches]) => (
              <section key={phase}>
                <h4 className="font-display text-lg font-bold text-chalk-muted mb-2">{fmtPhase(phase)}</h4>
                <div className="space-y-2">
                  {phaseMatches.map(m => <MatchCard key={m.id} match={m} onEdit={() => onEdit(m)} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── Championship Detail ──────────────────────────────────────────────────────

function MatchCard({ match, onEdit }: { match: Match; onEdit: () => void }) {
  const [p1, p2] = match.participants
  const p1Wins = !!match.winnerId && match.winnerId === p1?.id
  const p2Wins = !!match.winnerId && match.winnerId === p2?.id
  const isDraw = !match.winnerId
  const hasPens = (p1?.penaltyShootoutGoals ?? 0) > 0 || (p2?.penaltyShootoutGoals ?? 0) > 0

  const nameCls = (wins: boolean) =>
    cn('text-[15px] font-semibold truncate', wins ? 'text-chalk' : 'text-chalk-faint')
  const goalCls = (wins: boolean) =>
    cn('font-display text-4xl font-black tabular-nums leading-none w-8 text-center', wins || isDraw ? 'text-chalk' : 'text-chalk-faint')

  return (
    <div className="grid grid-cols-[1fr,auto,1fr,auto] items-center gap-3 sm:gap-5 rounded-xl bg-turf-bg/70 border border-turf-line/70 pl-4 sm:pl-6 pr-2 py-3">
      <span className={cn(nameCls(p1Wins), 'text-right')}>{p1?.name ?? '?'}</span>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <span className={goalCls(p1Wins)}>{p1?.goals ?? 0}</span>
          <span className="text-chalk-faint text-lg">–</span>
          <span className={goalCls(p2Wins)}>{p2?.goals ?? 0}</span>
        </div>
        {hasPens && (
          <span className="text-[11px] text-chalk-faint mt-1 tabular-nums">
            {p1?.penaltyShootoutGoals}–{p2?.penaltyShootoutGoals} on pens
          </span>
        )}
        {isDraw && !hasPens && <span className="text-[11px] text-chalk-faint mt-1">Draw</span>}
      </div>
      <span className={nameCls(p2Wins)}>{p2?.name ?? '?'}</span>
      <button
        onClick={onEdit}
        aria-label={`Edit ${p1?.name ?? ''} vs ${p2?.name ?? ''}`}
        className="p-2 rounded-md text-chalk-faint hover:text-chalk hover:bg-turf-raised transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  )
}

/**
 * A player's rating going into a cup. The 0-100 overall only exists from
 * mid-2025, so earlier cups show N/A, with the old 1-5 rating on hover.
 */
function EnteringRating({ rating }: { rating: RatingPoint | null }) {
  if (rating?.scale === 'POINTS_100') {
    return <span className="text-xs font-bold text-chalk-faint tabular-nums">{rating.overall}</span>
  }
  const why = rating
    ? `No 0–100 rating yet: rated ${rating.rawOverall.toFixed(1)} on the old 1–5 scale`
    : 'Not rated yet'
  return (
    <span title={why} aria-label={why} className="text-[10px] font-semibold uppercase tracking-wide text-chalk-faint/70">
      N/A
    </span>
  )
}

function GroupTable({ group, index }: { group: ChampionshipGroup; index: number }) {
  const sorted = [...group.players].sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference,
  )
  return (
    <div>
      <h4 className="font-display text-lg font-bold text-chalk-muted mb-1">
        Group {String.fromCharCode(65 + index)}
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-chalk-faint">
            <th className="text-left py-1.5 w-6 text-xs font-semibold">#</th>
            <th className="text-left py-1.5 text-xs font-semibold">Player</th>
            <th className="text-right py-1.5 w-12 text-xs font-semibold">GD</th>
            <th className="text-right py-1.5 w-12 text-xs font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={p.id} className="border-t border-turf-line/60">
              <td className={cn('py-2 tabular-nums', i < 2 ? 'text-gold font-semibold' : 'text-chalk-faint')}>{i + 1}</td>
              <td className="py-2 font-medium text-chalk">{p.name}</td>
              <td className={cn('py-2 text-right tabular-nums', p.goalDifference > 0 ? 'text-win' : p.goalDifference < 0 ? 'text-loss' : 'text-chalk-faint')}>
                {p.goalDifference > 0 ? '+' : ''}{p.goalDifference}
              </td>
              <td className="py-2 text-right font-display text-xl font-extrabold tabular-nums text-chalk">{p.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChampionshipDetail({
  champId,
  matchesSlot,
}: {
  champId: string
  /** Full-width area below the page's two columns, where the bracket gets room to breathe */
  matchesSlot: HTMLElement | null
}) {
  const [addMatch, setAddMatch] = useState(false)
  const [addDuo, setAddDuo] = useState(false)
  const [groupsExpanded, setGroupsExpanded] = useState(true)
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [deleteMatch, setDeleteMatch] = useState<Match | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['championship', champId],
    queryFn: () => championshipsApi.get(champId),
  })

  // Ratings as players entered this cup (shared with the "Ratings after this cup" panel)
  const { data: ratings } = useQuery({
    queryKey: ['rating-changes', champId],
    queryFn: () => championshipsApi.ratingChanges(champId),
  })
  const entering = new Map(ratings?.enteringRatings.map(e => [e.playerId, e.rating]) ?? [])

  const refetch = () => qc.invalidateQueries({ queryKey: ['championship', champId] })
  // A result feeds rankings, records, form and every player page, so refresh everything
  const refreshAll = () => qc.invalidateQueries()

  const deleteMut = useMutation({
    mutationFn: (m: Match) => championshipsApi.deleteMatch(champId, m.id),
    onSuccess: () => {
      setDeleteMatch(null)
      toast.success('Match deleted')
      refreshAll()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Loading />
  if (error) return <ErrorNote error={error} />
  if (!data) return null

  const c = data as Championship

  // Group matches by phase
  const matchesByPhase: Record<string, typeof c.matches> = {}
  c.matches.forEach(m => {
    const ph = m.matchPhase || 'Unknown';
    (matchesByPhase[ph] ??= []).push(m)
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="panel overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-chalk-muted">
                {fmtDate(c.createdAtIso)}
                {c.isDuo && <span className="ml-2 text-lower">Duo format</span>}
              </p>
              <h2 className="font-display text-5xl font-black leading-[0.9] text-chalk mt-1">{fmtCupFull(c.title)}</h2>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="subtle" onClick={() => setAddMatch(true)}>
                <Plus className="w-3.5 h-3.5" /> Add match
              </Button>
              {c.isDuo && (
                <Button size="sm" variant="subtle" onClick={() => setAddDuo(true)}>
                  <Users className="w-3.5 h-3.5" /> Add duo
                </Button>
              )}
            </div>
          </div>

          {/* Honours */}
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3',
                c.championshipWinner ? 'border-gold/35 bg-gold/[0.07]' : 'border-turf-line border-dashed',
              )}
            >
              <Trophy className={cn('w-6 h-6 shrink-0', c.championshipWinner ? 'text-gold' : 'text-chalk-faint')} />
              <div className="min-w-0">
                <p className="text-xs text-chalk-muted">Champion</p>
                <p className={cn('font-display text-2xl font-extrabold leading-tight truncate', c.championshipWinner ? 'text-chalk' : 'text-chalk-faint')}>
                  {c.championshipWinner?.name ?? 'Still being played'}
                </p>
              </div>
            </div>
            {c.goldenBootWinner && (
              <div className="flex items-center gap-3 rounded-xl border border-turf-line px-4 py-3">
                <Goal className="w-6 h-6 shrink-0 text-chalk-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-chalk-muted">Golden boot</p>
                  <p className="font-display text-2xl font-extrabold leading-tight text-chalk truncate">
                    {c.goldenBootWinner.name}
                  </p>
                </div>
                <p className="font-display text-3xl font-black tabular-nums text-chalk">
                  {c.goldenBootWinner.goals}
                  <span className="text-sm font-sans font-medium text-chalk-faint ml-1">goals</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {(c.players.length > 0 || (c.duos && c.duos.length > 0)) && (
          <div className="px-6 py-4 border-t border-turf-line space-y-3">
            {c.players.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-chalk-faint mb-2">
                  {c.players.length} {c.isDuo ? (c.players.length === 1 ? 'duo' : 'duos') : c.players.length === 1 ? 'player' : 'players'}
                  {!c.isDuo && <span className="font-normal">, with their rating going into this cup</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.players.map(p => {
                    const chip = 'inline-flex items-center gap-1.5 bg-turf-raised border border-turf-line rounded-md px-2.5 py-1 text-sm text-chalk'
                    const body = (
                      <>
                        {p.name}
                        {!c.isDuo && ratings && <EnteringRating rating={entering.get(p.id) ?? null} />}
                      </>
                    )
                    // In duo cups these are duos, which have no player page
                    return c.isDuo ? (
                      <span key={p.id} className={chip}>{body}</span>
                    ) : (
                      <Link key={p.id} to={`/players/${p.id}`} className={cn(chip, 'hover:border-gold/50 transition-colors')}>
                        {body}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {c.duos && c.duos.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-chalk-faint mb-2">
                  {c.duos.length} {c.duos.length === 1 ? 'duo' : 'duos'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.duos.map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center bg-lower/10 border border-lower/25 rounded-md px-2.5 py-1 text-sm text-chalk"
                    >
                      {fmtDuo(d.player1.name, d.player1.id, d.player2.name, d.player2.id)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <RatingChanges championshipId={c.id} />

      {/* Groups */}
      {c.groups && c.groups.length > 0 && (
        <section className="panel overflow-hidden">
          <button
            onClick={() => setGroupsExpanded(x => !x)}
            aria-expanded={groupsExpanded}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-turf-raised/40 transition-colors"
          >
            <span className="flex items-baseline gap-3">
              <span className="panel-title">Group stage</span>
              <span className="text-sm text-chalk-faint">{c.groups.length} groups</span>
            </span>
            <ChevronDown className={cn('w-4 h-4 text-chalk-faint transition-transform', groupsExpanded && 'rotate-180')} />
          </button>
          {groupsExpanded && (
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {c.groups.map((g, i) => <GroupTable key={g.id} group={g} index={i} />)}
            </div>
          )}
        </section>
      )}

      {/* Matches: rendered full width, below the cup list and this column */}
      {matchesSlot &&
        createPortal(
          <section className="panel overflow-hidden">
            <MatchViewTabs
              title={`${fmtCupFull(c.title)} ${new Date(c.createdAtIso).getUTCFullYear()}`}
              matches={c.matches} matchesByPhase={matchesByPhase} onEdit={setEditMatch} />
          </section>,
          matchesSlot,
        )}

      <Dialog open={addMatch} onClose={() => setAddMatch(false)} title="Add match" className="sm:max-w-lg">
        <MatchForm
          championship={c}
          onCancel={() => setAddMatch(false)}
          onSuccess={() => { setAddMatch(false); refreshAll() }}
        />
      </Dialog>

      <Dialog open={!!editMatch} onClose={() => setEditMatch(null)} title="Edit match" className="sm:max-w-lg">
        {editMatch && (
          <MatchForm
            key={editMatch.id}
            championship={c}
            match={editMatch}
            onCancel={() => setEditMatch(null)}
            onSuccess={() => { setEditMatch(null); refreshAll() }}
            onDelete={() => { setDeleteMatch(editMatch); setEditMatch(null) }}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleteMatch}
        title="Delete match?"
        message={
          deleteMatch && (
            <>
              <span className="font-semibold text-chalk">
                {deleteMatch.participants[0]?.name} {deleteMatch.participants[0]?.goals}–{deleteMatch.participants[1]?.goals}{' '}
                {deleteMatch.participants[1]?.name}
              </span>{' '}
              ({fmtPhase(deleteMatch.matchPhase)}){' '}
              {deleteMatch.matchPhase === 'GROUP_STAGE'
                ? 'will be removed and taken out of the group table.'
                : deleteMatch.matchPhase === 'FINALS'
                  ? 'will be removed, and the cup will have no champion until a final is recorded again.'
                  : 'will be removed from the cup and from every stat that counted it.'}{' '}
              This can't be undone.
            </>
          )
        }
        confirmLabel="Delete match"
        loading={deleteMut.isPending}
        onConfirm={() => deleteMatch && deleteMut.mutate(deleteMatch)}
        onCancel={() => setDeleteMatch(null)}
      />

      <Dialog open={addDuo} onClose={() => setAddDuo(false)} title="Add duo">
        <AddDuoForm
          champId={champId}
          onCancel={() => setAddDuo(false)}
          onSuccess={() => { setAddDuo(false); refetch() }}
        />
      </Dialog>
    </div>
  )
}

// ── Championship List ────────────────────────────────────────────────────────

function ChampionshipList({
  onSelect,
  activeId,
}: {
  onSelect: (id: string) => void
  activeId: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['championships'],
    queryFn: championshipsApi.list,
  })

  if (isLoading) return <Loading className="py-8" />

  if (!data?.length)
    return <Empty title="No championships yet" hint="Create one to start recording matches." className="py-8" />

  return (
    <ul className="space-y-1">
      {(data as ChampionshipBrief[]).map(c => {
        const active = activeId === c.id
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'w-full grid grid-cols-[1fr,auto] items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                active ? 'bg-turf-raised ring-1 ring-gold/40' : 'hover:bg-turf-raised/60',
              )}
            >
              <div className="min-w-0">
                <p className="font-display text-xl font-bold leading-tight text-chalk truncate">{fmtCup(c.title)}</p>
                <p className="text-xs text-chalk-faint mt-0.5">
                  {fmtDate(c.createdAtIso)}
                  {c.isDuo && <span className="ml-2 text-lower">Duo</span>}
                  <span className="ml-2 tabular-nums">
                    {c.matchCount} {c.matchCount === 1 ? 'match' : 'matches'}
                  </span>
                </p>
              </div>
              <div className="text-right max-w-[110px]">
                {c.winnerName ? (
                  <p className="flex items-center justify-end gap-1 text-sm font-semibold text-gold truncate">
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.winnerName}</span>
                  </p>
                ) : (
                  <p className="text-xs font-medium text-chalk-faint">In progress</p>
                )}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChampionshipsPage() {
  const { id: activeId = '' } = useParams()
  const navigate = useNavigate()
  const [inputId, setInputId] = useState(activeId)
  const [createOpen, setCreateOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [matchesSlot, setMatchesSlot] = useState<HTMLDivElement | null>(null)

  const handleSearch = () => {
    const id = inputId.trim()
    if (!id) { toast.error('Enter a championship ID'); return }
    navigate(`/championships/${id}`)
  }

  const handleSelect = (id: string) => {
    setInputId(id)
    navigate(`/championships/${id}`)
  }

  return (
    <>
      <PageHeader
        title="Championships"
        description="Every cup the group has played. Open one to see its groups, bracket and results, or to add a match."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New championship
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6 items-start">
        <aside className="panel p-3 lg:sticky lg:top-0">
          <ChampionshipList onSelect={handleSelect} activeId={activeId} />
          <div className="mt-3 pt-3 border-t border-turf-line px-1">
            <label htmlFor="champ-id" className="text-xs font-semibold text-chalk-faint">Open by ID</label>
            <div className="flex gap-2 mt-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-chalk-faint pointer-events-none" />
                <input
                  id="champ-id"
                  ref={inputRef}
                  value={inputId}
                  onChange={e => setInputId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Championship ID"
                  className="field pl-8 py-1.5"
                />
              </div>
              <Button size="sm" variant="subtle" className="h-auto" onClick={handleSearch}>Open</Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {activeId ? (
            <ChampionshipDetail key={activeId} champId={activeId} matchesSlot={matchesSlot} />
          ) : (
            <div className="panel border-dashed bg-transparent">
              <Empty title="Pick a championship" hint="Choose one from the list to see its results." className="py-20" />
            </div>
          )}
        </div>
      </div>

      <div ref={setMatchesSlot} className={cn(activeId && 'mt-6')} />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New championship">
        <CreateChampionshipForm onCancel={() => setCreateOpen(false)} onSuccess={() => setCreateOpen(false)} />
      </Dialog>
    </>
  )
}
