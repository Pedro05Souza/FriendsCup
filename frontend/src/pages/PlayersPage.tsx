import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, ChevronLeft, ChevronRight, Trash2, Pencil, Plus, Search, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { playersApi } from '../api/players'
import { Link } from 'react-router-dom'
import type { FormEntry, Player, PlayerFormData } from '../types'
import { cn, copyToClipboard, ratingTone } from '../lib/utils'
import Button from '../components/ui/Button'
import Dialog from '../components/ui/Dialog'
import RatingBar from '../components/ui/RatingBar'
import PageHeader from '../components/ui/PageHeader'
import PlayerLink from '../components/ui/PlayerLink'
import { Empty, Loading } from '../components/ui/States'

// ── Shared form ─────────────────────────────────────────────────────────────

function StatSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const id = `stat-${label.toLowerCase()}`
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label htmlFor={id} className="text-[13px] font-semibold text-chalk-muted">{label}</label>
        <span className={cn('font-display text-2xl font-extrabold tabular-nums leading-none', ratingTone(value))}>
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-gold cursor-pointer"
      />
    </div>
  )
}

function PlayerForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Partial<PlayerFormData>
  onSubmit: (data: PlayerFormData) => void
  onCancel: () => void
  loading?: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [attack, setAttack] = useState(initial?.attack ?? 50)
  const [defense, setDefense] = useState(initial?.defense ?? 50)
  const [intelligence, setIntelligence] = useState(initial?.intelligence ?? 50)
  const [mentality, setMentality] = useState(initial?.mentality ?? 50)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    onSubmit({ name: name.trim(), attack, defense, intelligence, mentality })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="player-name" className="field-label">Name</label>
        <input
          id="player-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Player name"
          autoFocus
          className="field"
        />
      </div>
      <StatSlider label="Attack" value={attack} onChange={setAttack} />
      <StatSlider label="Defense" value={defense} onChange={setDefense} />
      <StatSlider label="Intelligence" value={intelligence} onChange={setIntelligence} />
      <StatSlider label="Mentality" value={mentality} onChange={setMentality} />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initial?.name ? 'Save changes' : 'Add player'}
        </Button>
      </div>
    </form>
  )
}

// ── Form chips ───────────────────────────────────────────────────────────────

const FORM_COLOR: Record<string, string> = {
  W: 'bg-win text-turf-bg',
  D: 'bg-draw text-turf-bg',
  L: 'bg-loss text-turf-bg',
}

function FormChips({ playerId }: { playerId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['form', playerId],
    queryFn: () => playersApi.form(playerId),
    staleTime: 60_000,
  })

  if (isLoading)
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="w-5 h-5 rounded bg-turf-line animate-pulse" />
        ))}
      </div>
    )

  const entries = (data as FormEntry[] | undefined) ?? []
  const chips = Array.from({ length: 5 }, (_, i) => entries[i] ?? null)

  return (
    <div
      className="flex gap-1"
      title={entries.map(e =>
        `${e.result}${e.decidedByPenalties ? '(pens)' : ''} ${e.goalsFor}-${e.goalsAgainst} vs ${e.opponentName}`
      ).join('\n')}
    >
      {chips.map((e, i) => {
        if (!e) return <span key={i} className="w-5 h-5 rounded border border-dashed border-turf-line" />
        const displayLetter = e.decidedByPenalties ? 'D' : e.result
        const penSuffix = e.decidedByPenalties ? (e.result === 'W' ? 'p' : 'L') : null
        const colorKey = e.decidedByPenalties ? 'D' : e.result
        return (
          <span
            key={i}
            className={cn(
              'inline-flex items-center justify-center h-5 rounded text-[10px] font-bold px-1 min-w-[20px]',
              FORM_COLOR[colorKey],
            )}
          >
            {displayLetter}
            {penSuffix && <span className="text-[8px] opacity-75 ml-px">{penSuffix}</span>}
          </span>
        )
      })}
    </div>
  )
}

// ── Player row (component so it can call useQuery for form) ───────────────────

function Delta({ value, className }: { value?: number; className?: string }) {
  if (!value) return null
  return (
    <span className={cn('text-[11px] font-bold tabular-nums', value > 0 ? 'text-win' : 'text-loss', className)}>
      {value > 0 ? `+${value}` : value}
    </span>
  )
}

function PlayerRow({
  p,
  onEdit,
  onDelete,
  onCopyId,
  deleteLoading,
  ovrDelta,
  statDeltas,
}: {
  p: Player
  onEdit: (p: Player) => void
  onDelete: (p: Player) => void
  onCopyId: (id: string) => void
  deleteLoading: boolean
  ovrDelta?: number
  statDeltas?: { ovr: number; attack: number; defense: number; intelligence: number; mentality: number }
}) {
  return (
    <tr
      className={cn(
        'border-b border-turf-line/60 last:border-0 hover:bg-turf-raised/50 transition-colors',
        ovrDelta !== undefined && 'bg-win/[0.04]',
      )}
    >
      {/* Overall */}
      <td className="pl-5 pr-2 py-3">
        <div className="flex items-baseline gap-1">
          <span className={cn('font-display text-4xl font-black leading-none tabular-nums', ratingTone(p.overrallRating))}>
            {p.overrallRating}
          </span>
          <Delta value={ovrDelta} />
        </div>
      </td>
      {/* Name + ID */}
      <td className="px-4 py-3">
        <PlayerLink id={p.id} name={p.name} className="font-semibold text-[15px] text-chalk whitespace-nowrap" />
        <button
          onClick={() => onCopyId(p.id)}
          title="Copy player ID"
          className="flex items-center gap-1 text-[11px] text-chalk-faint hover:text-chalk-muted transition-colors mt-0.5 tabular-nums"
        >
          <Copy className="w-3 h-3" />
          {p.id.slice(0, 8)}
        </button>
      </td>
      {/* Stat bars */}
      {(['attack', 'defense', 'intelligence', 'mentality'] as const).map(stat => (
        <td key={stat} className="px-4 py-3 min-w-[120px]">
          <div className="flex items-center gap-1.5">
            <RatingBar value={p[stat]} className="flex-1" />
            <Delta value={statDeltas?.[stat]} className="text-[10px] shrink-0" />
          </div>
        </td>
      ))}
      {/* Form */}
      <td className="px-4 py-3"><FormChips playerId={p.id} /></td>
      {/* Actions */}
      <td className="pl-4 pr-5 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/players/${p.id}`}
            className="inline-flex items-center h-8 px-2.5 text-xs font-medium rounded-md border bg-turf-raised text-chalk border-turf-line hover:border-chalk-faint transition-colors"
          >
            Open
          </Link>
          <Button size="sm" variant="ghost" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(p)}
            loading={deleteLoading}
            aria-label={`Delete ${p.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PlayersPage() {
  type SortKey = 'overrallRating' | 'attack' | 'defense' | 'intelligence' | 'mentality' | 'name'
  type SortDir = 'asc' | 'desc'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('overrallRating')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [createOpen, setCreateOpen] = useState(false)
  const [editPlayer, setEditPlayer] = useState<Player | null>(null)

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['players', page, search],
    queryFn: () => playersApi.list(page, search || undefined),
  })

  const createMut = useMutation({
    mutationFn: playersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players'] })
      setCreateOpen(false)
      toast.success('Player added')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  interface StatDeltas {
    ovr: number; attack: number; defense: number; intelligence: number; mentality: number
  }
  const [statDeltas, setStatDeltas] = useState<Map<string, StatDeltas>>(new Map())

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; data: PlayerFormData; old: Player }) =>
      playersApi.update(vars.id, vars.data),
    onSuccess: (result, vars) => {
      const p = result as Player
      const deltas: StatDeltas = {
        ovr:          p.overrallRating   - vars.old.overrallRating,
        attack:       p.attack           - vars.old.attack,
        defense:      p.defense          - vars.old.defense,
        intelligence: p.intelligence     - vars.old.intelligence,
        mentality:    p.mentality        - vars.old.mentality,
      }
      const hasChange = Object.values(deltas).some(d => d !== 0)
      if (hasChange) setStatDeltas(prev => new Map(prev).set(vars.id, deltas))
      qc.invalidateQueries({ queryKey: ['players'] })
      setEditPlayer(null)
      toast.success(`Changes saved${deltas.ovr !== 0 ? ` (OVR ${deltas.ovr > 0 ? '+' : ''}${deltas.ovr})` : ''}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: playersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players'] })
      toast.success('Player deleted')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleDelete = (p: Player) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    deleteMut.mutate(p.id)
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortedPlayers = useMemo(() => {
    const players = data?.players ?? []
    return [...players].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
  }, [data?.players, sortKey, sortDir])

  const handleCopyId = async (id: string) => {
    await copyToClipboard(id)
    toast.info('Player ID copied')
  }

  const columns: { label: string; key: SortKey | null; className?: string }[] = [
    { label: 'OVR', key: 'overrallRating', className: 'pl-5 pr-2' },
    { label: 'Player', key: 'name' },
    { label: 'Attack', key: 'attack' },
    { label: 'Defense', key: 'defense' },
    { label: 'Intelligence', key: 'intelligence' },
    { label: 'Mentality', key: 'mentality' },
    { label: 'Last 5', key: null },
    { label: '', key: null },
  ]

  return (
    <>
      <PageHeader
        title="Players"
        description="Everyone in the group, with their attributes and last five results."
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chalk-faint pointer-events-none" />
              <label htmlFor="player-search" className="sr-only">Search players</label>
              <input
                id="player-search"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name"
                className="field h-10 pl-9 w-52"
              />
            </div>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Add player
            </Button>
          </>
        }
      />

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-turf-line">
                {columns.map(({ label, key, className }, i) => (
                  <th key={i} className={cn('px-4 py-3 text-left text-xs font-semibold text-chalk-faint', className)}>
                    {key ? (
                      <button
                        onClick={() => handleSort(key)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-chalk transition-colors',
                          sortKey === key && 'text-chalk',
                        )}
                      >
                        {label}
                        {sortKey === key
                          ? sortDir === 'desc'
                            ? <ChevronDown className="w-3.5 h-3.5 text-gold" />
                            : <ChevronUp className="w-3.5 h-3.5 text-gold" />
                          : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8}><Loading /></td></tr>
              ) : !data?.players.length ? (
                <tr>
                  <td colSpan={8}>
                    <Empty
                      title={search ? `No one called “${search}”` : 'No players yet'}
                      hint={search ? 'Check the spelling or clear the search.' : 'Add the first player to get started.'}
                    />
                  </td>
                </tr>
              ) : (
                sortedPlayers.map(p => (
                  <PlayerRow
                    key={p.id}
                    p={p}
                    onEdit={setEditPlayer}
                    onDelete={handleDelete}
                    onCopyId={handleCopyId}
                    deleteLoading={deleteMut.isPending && deleteMut.variables === p.id}
                    ovrDelta={statDeltas.get(p.id)?.ovr}
                    statDeltas={statDeltas.get(p.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && (page > 1 || data.hasMore) && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-turf-line">
            <span className="text-sm text-chalk-faint">Page {page}</span>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <Button size="sm" variant="ghost" disabled={!data.hasMore} onClick={() => setPage(p => p + 1)}>
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Add player">
        <PlayerForm
          onSubmit={createMut.mutate}
          onCancel={() => setCreateOpen(false)}
          loading={createMut.isPending}
        />
      </Dialog>

      <Dialog open={!!editPlayer} onClose={() => setEditPlayer(null)} title={`Edit ${editPlayer?.name ?? ''}`}>
        {editPlayer && (
          <PlayerForm
            initial={editPlayer}
            onSubmit={data => updateMut.mutate({ id: editPlayer.id, data, old: editPlayer })}
            onCancel={() => setEditPlayer(null)}
            loading={updateMut.isPending}
          />
        )}
      </Dialog>

    </>
  )
}
