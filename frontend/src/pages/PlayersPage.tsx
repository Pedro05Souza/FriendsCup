import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, ChevronLeft, ChevronRight, Trash2, Pencil, BarChart2, Plus, Search } from 'lucide-react'
import { playersApi } from '../api/players'
import type { Player, PlayerFormData, RetrospectData } from '../types'
import { fmtPhase, copyToClipboard } from '../lib/utils'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Dialog from '../components/ui/Dialog'
import Spinner from '../components/ui/Spinner'
import StatCard from '../components/ui/StatCard'
import RatingBar from '../components/ui/RatingBar'
import RadarChart from '../components/ui/RadarChart'

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
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <span className="text-xs font-bold text-emerald-400">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500 cursor-pointer"
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Player name"
          autoFocus
          className="w-full px-3 py-2 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>
      <StatSlider label="Attack" value={attack} onChange={setAttack} />
      <StatSlider label="Defense" value={defense} onChange={setDefense} />
      <StatSlider label="Intelligence" value={intelligence} onChange={setIntelligence} />
      <StatSlider label="Mentality" value={mentality} onChange={setMentality} />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initial?.name ? 'Save Changes' : 'Create Player'}
        </Button>
      </div>
    </form>
  )
}

// ── Retrospect Modal ─────────────────────────────────────────────────────────

function RetrospectContent({
  player,
}: {
  player: Player
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['retrospect', player.id],
    queryFn: () => playersApi.retrospect(player.id),
  })

  const radarAxes = [
    { label: 'Attack', value: player.attack },
    { label: 'Defense', value: player.defense },
    { label: 'Intelligence', value: player.intelligence },
    { label: 'Mentality', value: player.mentality },
    { label: 'Overall', value: player.overrallRating },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <RadarChart axes={radarAxes} size={200} />
      </div>

      {isLoading && <div className="flex justify-center py-4"><Spinner /></div>}
      {error && <p className="text-red-400 text-sm">{(error as Error).message}</p>}

      {data && (() => {
        const d = data as RetrospectData
        return (
          <>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Matches" value={d.totalMatches} />
              <StatCard label="Wins" value={d.totalWins} valueClassName="text-emerald-400" />
              <StatCard label="Losses" value={d.totalLosses} valueClassName="text-red-400" />
              <StatCard label="Draws" value={d.totalDraws} valueClassName="text-amber-400" />
              <StatCard label="Goals" value={d.totalGoals} />
              <StatCard label="Win Rate" value={`${d.winRate}%`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Avg Goals / Match" value={d.averageGoalsPerMatch} valueClassName="text-xl" />
              <StatCard label="Furthest Stage" value={fmtPhase(d.furthestStageReached)} valueClassName="text-sm text-amber-400" />
            </div>
          </>
        )
      })()}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PlayersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editPlayer, setEditPlayer] = useState<Player | null>(null)
  const [retroPlayer, setRetroPlayer] = useState<Player | null>(null)

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
      toast.success('Player created!')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlayerFormData }) =>
      playersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players'] })
      setEditPlayer(null)
      toast.success('Player updated')
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

  const handleCopyId = async (id: string) => {
    await copyToClipboard(id)
    toast.info('ID copied to clipboard')
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Players</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage all registered players</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name…"
              className="pl-8 pr-3 py-1.5 rounded-md border border-gh-border bg-gh-bg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 w-44 transition-colors"
            />
          </div>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Player
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gh-border">
                {['Player', 'OVR', 'Attack', 'Defense', 'Intelligence', 'Mentality', ''].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : !data?.players.length ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-600 text-sm">
                    No players found
                  </td>
                </tr>
              ) : (
                data.players.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-gh-border/50 hover:bg-gh-elevated/40 transition-colors"
                  >
                    {/* Name + ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                          {p.overrallRating}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-100">{p.name}</p>
                          <button
                            onClick={() => handleCopyId(p.id)}
                            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors mt-0.5"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            {p.id.slice(0, 8)}…
                          </button>
                        </div>
                      </div>
                    </td>
                    {/* Overall */}
                    <td className="px-4 py-3">
                      <Badge variant={p.overrallRating >= 75 ? 'green' : p.overrallRating >= 50 ? 'yellow' : 'red'}>
                        {p.overrallRating}
                      </Badge>
                    </td>
                    {/* Stat bars */}
                    <td className="px-4 py-3 min-w-[100px]"><RatingBar value={p.attack} /></td>
                    <td className="px-4 py-3 min-w-[100px]"><RatingBar value={p.defense} /></td>
                    <td className="px-4 py-3 min-w-[100px]"><RatingBar value={p.intelligence} /></td>
                    <td className="px-4 py-3 min-w-[100px]"><RatingBar value={p.mentality} /></td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => setRetroPlayer(p)}
                        >
                          <BarChart2 className="w-3 h-3" />
                          Stats
                        </Button>
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => setEditPlayer(p)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(p)}
                          loading={deleteMut.isPending && deleteMut.variables === p.id}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gh-border">
            <span className="text-xs text-zinc-600">Page {page}</span>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              <Button size="sm" variant="ghost" disabled={!data.hasMore} onClick={() => setPage(p => p + 1)}>
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="New Player">
        <PlayerForm
          onSubmit={createMut.mutate}
          onCancel={() => setCreateOpen(false)}
          loading={createMut.isPending}
        />
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editPlayer}
        onClose={() => setEditPlayer(null)}
        title={`Edit — ${editPlayer?.name}`}
      >
        {editPlayer && (
          <PlayerForm
            initial={editPlayer}
            onSubmit={data => updateMut.mutate({ id: editPlayer.id, data })}
            onCancel={() => setEditPlayer(null)}
            loading={updateMut.isPending}
          />
        )}
      </Dialog>

      {/* Retrospect Dialog */}
      <Dialog
        open={!!retroPlayer}
        onClose={() => setRetroPlayer(null)}
        title={`${retroPlayer?.name ?? ''} — Profile`}
        className="max-w-sm"
      >
        {retroPlayer && <RetrospectContent player={retroPlayer} />}
      </Dialog>
    </>
  )
}
