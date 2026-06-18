import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Plus, ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { championshipsApi, type CreateMatchData } from '../api/championships'
import { playersApi } from '../api/players'
import type { Championship, ChampionshipBrief, ChampionshipGroup, Player } from '../types'
import { cn, fmtDate, fmtPhase, fmtDuo, ALL_PHASES, TOURNAMENT_NAMES } from '../lib/utils'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Dialog from '../components/ui/Dialog'
import Spinner from '../components/ui/Spinner'
import BracketView from '../components/BracketView'

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

  const mut = useMutation({
    mutationFn: championshipsApi.create,
    onSuccess: () => {
      toast.success('Championship created — look it up by ID to manage it')
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
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tournament</label>
        <select
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
        >
          {TOURNAMENT_NAMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={mut.isPending}>Create</Button>
      </div>
    </form>
  )
}

// ── Player picker ────────────────────────────────────────────────────────────

function PlayerPicker({
  label,
  value,
  onChange,
  players,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  players: Player[]
}) {
  const filtered = players
  const selected = players.find(p => p.id === value)

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="">— Select player —</option>
          {filtered.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.overrallRating} OVR)
            </option>
          ))}
        </select>
        {selected && (
          <p className="text-[10px] text-zinc-600 mt-0.5 truncate font-mono">{value}</p>
        )}
      </div>
    </div>
  )
}

// ── Add Match Form ───────────────────────────────────────────────────────────

function AddMatchForm({
  champId,
  groups,
  onCancel,
  onSuccess,
}: {
  champId: string
  groups: ChampionshipGroup[]
  onCancel: () => void
  onSuccess: () => void
}) {
  const [phase, setPhase] = useState(ALL_PHASES[0])
  const [groupId, setGroupId] = useState('')
  const [p1Id, setP1Id] = useState('')
  const [p1Goals, setP1Goals] = useState(0)
  const [p1Pen, setP1Pen] = useState(0)
  const [p2Id, setP2Id] = useState('')
  const [p2Goals, setP2Goals] = useState(0)
  const [p2Pen, setP2Pen] = useState(0)

  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players-all'],
    queryFn: playersApi.all,
  })

  const mut = useMutation({
    mutationFn: (data: CreateMatchData) => championshipsApi.createMatch(champId, data),
    onSuccess: () => {
      toast.success('Match added')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!p1Id || !p2Id) { toast.error('Both participants are required'); return }
    if (p1Id === p2Id) { toast.error('Participants must be different players'); return }
    mut.mutate({
      matchPhase: phase,
      groupId: groupId || undefined,
      participants: [
        { id: p1Id, goals: p1Goals, penaltyShootoutGoals: p1Pen || undefined },
        { id: p2Id, goals: p2Goals, penaltyShootoutGoals: p2Pen || undefined },
      ],
    })
  }

  const inputCls = 'w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors'
  const numCls = `${inputCls} text-center`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Phase</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className={inputCls}>
            {ALL_PHASES.map(p => <option key={p} value={p}>{fmtPhase(p)}</option>)}
          </select>
        </div>
        {groups.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Group</label>
            <select value={groupId} onChange={e => setGroupId(e.target.value)} className={inputCls}>
              <option value="">— Knockout —</option>
              {groups.map((g, i) => (
                <option key={g.id} value={g.id}>Group {String.fromCharCode(65 + i)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {([
        { label: 'Participant 1', id: p1Id, setId: setP1Id, goals: p1Goals, setGoals: setP1Goals, pen: p1Pen, setPen: setP1Pen },
        { label: 'Participant 2', id: p2Id, setId: setP2Id, goals: p2Goals, setGoals: setP2Goals, pen: p2Pen, setPen: setP2Pen },
      ] as const).map(({ label, id, setId, goals, setGoals, pen, setPen }) => (
        <div key={label} className="space-y-2">
          <PlayerPicker
            label={label}
            value={id}
            onChange={setId}
            players={allPlayers as Player[]}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input type="number" min={0} value={goals} onChange={e => setGoals(Number(e.target.value))} className={numCls} />
              <p className="text-[10px] text-zinc-600 text-center mt-0.5">Goals</p>
            </div>
            <div>
              <input type="number" min={0} value={pen} onChange={e => setPen(Number(e.target.value))} className={numCls} />
              <p className="text-[10px] text-zinc-600 text-center mt-0.5">Penalty goals</p>
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={mut.isPending}>Add Match</Button>
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
      toast.success('Duo created')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const inputCls = 'w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500'

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
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Duo Name (optional)</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Untouchables" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Player 1 ID</label>
        <input value={p1Id} onChange={e => setP1Id(e.target.value)} placeholder="UUID..." className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Player 2 ID</label>
        <input value={p2Id} onChange={e => setP2Id(e.target.value)} placeholder="UUID..." className={inputCls} />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={mut.isPending}>Create Duo</Button>
      </div>
    </form>
  )
}

// ── Match view tabs (bracket + list) ────────────────────────────────────────

function MatchViewTabs({
  matches,
  matchesByPhase,
}: {
  matches: Championship['matches']
  matchesByPhase: Record<string, Championship['matches']>
}) {
  const [tab, setTab] = useState<'bracket' | 'list'>('bracket')

  const tabCls = (active: boolean) =>
    cn(
      'px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer',
      active
        ? 'border-emerald-500 text-emerald-400'
        : 'border-transparent text-zinc-500 hover:text-zinc-300',
    )

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-gh-border">
        <div className="flex gap-1">
          <button className={tabCls(tab === 'bracket')} onClick={() => setTab('bracket')}>
            Bracket
          </button>
          <button className={tabCls(tab === 'list')} onClick={() => setTab('list')}>
            List
          </button>
        </div>
        <span className="text-xs text-zinc-600 pb-2">{matches.length} matches</span>
      </div>

      <div className="p-5">
        {matches.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-6">No matches yet</p>
        ) : tab === 'bracket' ? (
          <BracketView matches={matches} />
        ) : (
          Object.entries(matchesByPhase).map(([phase, phaseMatches], i) => (
            <div key={phase}>
              <div className={cn('flex items-center gap-3 mb-3', i > 0 ? 'mt-6' : 'mt-0')}>
                <div className="flex-1 h-px bg-gh-border" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 px-1">
                  {fmtPhase(phase)}
                </span>
                <div className="flex-1 h-px bg-gh-border" />
              </div>
              {phaseMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          ))
        )}
      </div>
    </>
  )
}

// ── Championship Detail ──────────────────────────────────────────────────────

function MatchCard({ match }: { match: Championship['matches'][number] }) {
  const [p1, p2] = match.participants
  const p1Wins = !!match.winnerId && match.winnerId === p1?.id
  const p2Wins = !!match.winnerId && match.winnerId === p2?.id
  const isDraw = !match.winnerId
  const hasPens = (p1?.penaltyShootoutGoals ?? 0) > 0 || (p2?.penaltyShootoutGoals ?? 0) > 0

  return (
    <div className="grid grid-cols-[1fr,96px,1fr] border border-gh-border/50 rounded-lg overflow-hidden mb-2 hover:border-gh-border transition-colors">
      {/* Team 1 */}
      <div className={cn(
        'flex items-center justify-end px-5 py-3.5',
        p1Wins ? 'bg-white/[0.05]' : 'bg-gh-bg',
      )}>
        <span className={cn(
          'text-sm font-semibold truncate',
          p1Wins ? 'text-zinc-100' : 'text-zinc-500',
        )}>
          {p1?.name ?? '?'}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center justify-center border-x border-gh-border/40 py-2.5 bg-gh-elevated/40">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'text-xl font-bold tabular-nums w-5 text-center leading-none',
            p1Wins ? 'text-zinc-100' : 'text-zinc-500',
          )}>
            {p1?.goals ?? 0}
          </span>
          <span className="text-zinc-600 text-sm">–</span>
          <span className={cn(
            'text-xl font-bold tabular-nums w-5 text-center leading-none',
            p2Wins ? 'text-zinc-100' : 'text-zinc-500',
          )}>
            {p2?.goals ?? 0}
          </span>
        </div>
        {hasPens && (
          <span className="text-[10px] text-zinc-600 mt-1 tabular-nums">
            ({p1?.penaltyShootoutGoals}–{p2?.penaltyShootoutGoals} pens)
          </span>
        )}
        {isDraw && (
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
            Draw
          </span>
        )}
      </div>

      {/* Team 2 */}
      <div className={cn(
        'flex items-center px-5 py-3.5',
        p2Wins ? 'bg-white/[0.05]' : 'bg-gh-bg',
      )}>
        <span className={cn(
          'text-sm font-semibold truncate',
          p2Wins ? 'text-zinc-100' : 'text-zinc-500',
        )}>
          {p2?.name ?? '?'}
        </span>
      </div>
    </div>
  )
}

function GroupTable({ group, index }: { group: ChampionshipGroup; index: number }) {
  const sorted = [...group.players].sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference,
  )
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
        Group {String.fromCharCode(65 + index)}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gh-border">
            <th className="text-left px-2 pb-1.5 text-[11px] text-zinc-600 font-medium">#</th>
            <th className="text-left px-2 pb-1.5 text-[11px] text-zinc-600 font-medium">Player</th>
            <th className="text-center px-2 pb-1.5 text-[11px] text-zinc-600 font-medium">Pts</th>
            <th className="text-center px-2 pb-1.5 text-[11px] text-zinc-600 font-medium">GD</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={p.id} className="border-b border-gh-border/30 last:border-0">
              <td className="px-2 py-2 text-zinc-600">{i + 1}</td>
              <td className="px-2 py-2 font-medium">{p.name}</td>
              <td className="px-2 py-2 text-center font-bold">{p.points}</td>
              <td
                className={
                  'px-2 py-2 text-center font-medium ' +
                  (p.goalDifference >= 0 ? 'text-emerald-400' : 'text-red-400')
                }
              >
                {p.goalDifference >= 0 ? '+' : ''}{p.goalDifference}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChampionshipDetail({ champId }: { champId: string }) {
  const [addMatch, setAddMatch] = useState(false)
  const [addDuo, setAddDuo] = useState(false)
  const [groupsExpanded, setGroupsExpanded] = useState(true)
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['championship', champId],
    queryFn: () => championshipsApi.get(champId),
  })

  const refetch = () => qc.invalidateQueries({ queryKey: ['championship', champId] })

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>
  if (error) return (
    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      {(error as Error).message}
    </p>
  )
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
      {/* Header card */}
      <div className="bg-gh-surface border border-gh-border rounded-lg p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{c.title}</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{fmtDate(c.createdAtIso)}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {c.championshipWinner ? (
              <Badge variant="yellow">🏆 {c.championshipWinner.name}</Badge>
            ) : (
              <Badge variant="blue">⏳ Ongoing</Badge>
            )}
            {c.goldenBootWinner && (
              <Badge variant="green">
                ⚽ {c.goldenBootWinner.name} ({c.goldenBootWinner.goals}g)
              </Badge>
            )}
          </div>
        </div>

        {/* Participants */}
        {c.players.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">
              Participants ({c.players.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.players.map(p => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 bg-gh-elevated border border-gh-border rounded-full px-2.5 py-1 text-xs"
                >
                  {p.name}
                  {p.overallRating != null && (
                    <span className="text-emerald-400 font-bold">{p.overallRating}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Duos */}
        {c.duos && c.duos.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">
              Duos ({c.duos.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.duos.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-gh-elevated border border-gh-border rounded-full px-2.5 py-1 text-xs"
                >
                  {fmtDuo(d.player1.name, d.player1.id, d.player2.name, d.player2.id)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="subtle" onClick={() => setAddMatch(true)}>
            <Plus className="w-3 h-3" /> Add Match
          </Button>
          {c.isDuo && (
            <Button size="sm" variant="subtle" onClick={() => setAddDuo(true)}>
              <Plus className="w-3 h-3" /> Add Duo
            </Button>
          )}
        </div>
      </div>

      {/* Groups */}
      {c.groups && c.groups.length > 0 && (
        <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
          <button
            onClick={() => setGroupsExpanded(x => !x)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gh-elevated/50 transition-colors"
          >
            <span className="text-sm font-semibold">Groups ({c.groups.length})</span>
            {groupsExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>
          {groupsExpanded && (
            <div className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-6">
                {c.groups.map((g, i) => <GroupTable key={g.id} group={g} index={i} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matches */}
      <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
        {/* Tab header */}
        <MatchViewTabs matches={c.matches} matchesByPhase={matchesByPhase} />
      </div>

      {/* Dialogs */}
      <Dialog open={addMatch} onClose={() => setAddMatch(false)} title="Add Match">
        <AddMatchForm
          champId={champId}
          groups={c.groups ?? []}
          onCancel={() => setAddMatch(false)}
          onSuccess={() => { setAddMatch(false); refetch() }}
        />
      </Dialog>

      <Dialog open={addDuo} onClose={() => setAddDuo(false)} title="Add Duo">
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

  if (isLoading) return (
    <div className="flex justify-center py-8"><Spinner /></div>
  )

  if (!data?.length) return (
    <p className="text-sm text-zinc-600 text-center py-6">No championships yet</p>
  )

  return (
    <div className="space-y-1.5">
      {(data as ChampionshipBrief[]).map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={cn(
            'w-full flex items-center gap-4 px-4 py-3 rounded-lg border text-left transition-colors',
            activeId === c.id
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-gh-bg border-gh-border/50 hover:bg-gh-elevated hover:border-gh-border',
          )}
        >
          {/* Icon */}
          <div className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-sm',
            c.winnerName ? 'bg-amber-500/10' : 'bg-gh-elevated',
          )}>
            {c.winnerName ? <Trophy className="w-4 h-4 text-amber-400" /> : <span className="text-zinc-600">⏳</span>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-semibold truncate',
              activeId === c.id ? 'text-emerald-400' : 'text-zinc-100',
            )}>
              {c.title}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(c.createdAtIso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              {c.isDuo && <span className="ml-2 text-blue-400">· Duo</span>}
            </p>
          </div>

          {/* Right side */}
          <div className="text-right shrink-0">
            {c.winnerName ? (
              <p className="text-xs text-amber-400 font-medium">🏆 {c.winnerName}</p>
            ) : (
              <p className="text-xs text-zinc-600">Ongoing</p>
            )}
            <p className="text-xs text-zinc-600 mt-0.5">{c.matchCount} match{c.matchCount !== 1 ? 'es' : ''}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChampionshipsPage() {
  const [inputId, setInputId] = useState('')
  const [activeId, setActiveId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = () => {
    const id = inputId.trim()
    if (!id) { toast.error('Enter a championship ID'); return }
    setActiveId(id)
  }

  const handleSelect = (id: string) => {
    setActiveId(id)
    setInputId(id)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Championships</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Create and manage tournaments</p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Championship
        </Button>
      </div>

      <div className="grid grid-cols-[300px,1fr] gap-6 items-start">
        {/* Left — list */}
        <div className="bg-gh-surface border border-gh-border rounded-lg p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            All Championships
          </p>
          <ChampionshipList onSelect={handleSelect} activeId={activeId} />
        </div>

        {/* Right — detail / search */}
        <div>
          <div className="bg-gh-surface border border-gh-border rounded-lg p-4 mb-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Look up by ID
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  ref={inputRef}
                  value={inputId}
                  onChange={e => setInputId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Paste championship UUID..."
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <Button variant="primary" onClick={handleSearch}>Search</Button>
            </div>
          </div>

          {activeId && <ChampionshipDetail key={activeId} champId={activeId} />}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New Championship">
        <CreateChampionshipForm
          onCancel={() => setCreateOpen(false)}
          onSuccess={() => setCreateOpen(false)}
        />
      </Dialog>
    </>
  )
}
