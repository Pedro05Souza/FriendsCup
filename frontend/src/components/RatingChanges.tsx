import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowDownRight, ArrowUpRight, Save } from 'lucide-react'
import { championshipsApi } from '../api/championships'
import type { RatingChange, RatingPoint } from '../types'
import { cn } from '../lib/utils'
import Button from './ui/Button'
import ConfirmDialog from './ui/ConfirmDialog'
import PlayerLink from './ui/PlayerLink'
import { ErrorNote, Loading } from './ui/States'

/** A rating as originally given: "4.7" on the old scale, "86" on the 0-100 one. */
function shown(p: RatingPoint) {
  return p.scale === 'LEGACY_5' ? p.rawOverall.toFixed(1) : String(p.overall)
}

/** The change in the ratings' own scale when both share one, else on 0-100. */
function shownDelta(c: RatingChange) {
  const d = c.rawDelta ?? c.delta
  const text = c.after.scale === 'LEGACY_5' && c.rawDelta !== null ? Math.abs(d).toFixed(1) : String(Math.abs(d))
  return d > 0 ? `+${text}` : d < 0 ? `−${text}` : '0'
}

function Callout({ change, kind }: { change: RatingChange; kind: 'rise' | 'fall' }) {
  const rise = kind === 'rise'
  const Icon = rise ? ArrowUpRight : ArrowDownRight
  return (
    <div className={cn('rounded-xl border px-4 py-3', rise ? 'border-win/30 bg-win/[0.06]' : 'border-loss/30 bg-loss/[0.06]')}>
      <p className={cn('flex items-center gap-1 text-xs font-semibold', rise ? 'text-win' : 'text-loss')}>
        <Icon className="w-3.5 h-3.5" /> {rise ? 'Biggest rise' : 'Biggest fall'}
      </p>
      <div className="flex items-baseline justify-between gap-3 mt-0.5">
        <PlayerLink id={change.playerId} name={change.playerName} className="font-display text-2xl font-extrabold text-chalk truncate" />
        <span className={cn('font-display text-3xl font-black tabular-nums', rise ? 'text-win' : 'text-loss')}>
          {shownDelta(change)}
        </span>
      </div>
      <p className="text-xs text-chalk-muted tabular-nums">
        {shown(change.before)} → {shown(change.after)}
      </p>
    </div>
  )
}

/** How ratings moved after a cup, and saving today's ratings for the latest cup. */
export default function RatingChanges({ championshipId }: { championshipId: string }) {
  const qc = useQueryClient()
  const [confirmReplace, setConfirmReplace] = useState(false)
  const { data, isLoading, error } = useQuery({
    queryKey: ['rating-changes', championshipId],
    queryFn: () => championshipsApi.ratingChanges(championshipId),
  })

  const save = useMutation({
    mutationFn: () => championshipsApi.saveRatings(championshipId),
    onSuccess: r => {
      setConfirmReplace(false)
      toast.success(`Ratings saved for ${r.saved} ${r.saved === 1 ? 'player' : 'players'}`)
      qc.invalidateQueries({ queryKey: ['rating-changes'] })
      qc.invalidateQueries({ queryKey: ['rating-history'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Loading className="py-6" />
  if (error) return <ErrorNote error={error} />
  if (!data) return null
  // Nothing to show for an old cup with no saved ratings
  if (!data.saved && !data.canSave) return null

  const rise = data.changes.find(c => c.delta > 0)
  const fall = [...data.changes].reverse().find(c => c.delta < 0)
  const mixedScales = data.changes.some(c => c.rawDelta === null)

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4">
        <div>
          <h3 className="panel-title">Ratings after this cup</h3>
          {data.canSave && (
            <p className="text-sm text-chalk-faint mt-1.5 max-w-md">
              Update players' ratings first, then save them here so this cup keeps a record of them.
            </p>
          )}
        </div>
        {data.canSave && (
          <Button
            size="sm"
            variant={data.saved ? 'subtle' : 'primary'}
            loading={save.isPending && !confirmReplace}
            onClick={() => (data.saved ? setConfirmReplace(true) : save.mutate())}
          >
            <Save className="w-3.5 h-3.5" />
            {data.saved ? 'Update saved ratings' : 'Save ratings for this cup'}
          </Button>
        )}
      </div>

      {data.saved && (
        <div className="px-5 sm:px-6 pb-5 space-y-4">
          {(rise || fall) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {rise && <Callout change={rise} kind="rise" />}
              {fall && <Callout change={fall} kind="fall" />}
            </div>
          )}

          {data.changes.length > 0 && (
            <ol className="divide-y divide-turf-line/60 border-y border-turf-line">
              {data.changes.map(c => (
                <li key={c.playerId} className="grid grid-cols-[1fr,auto,3.5rem] items-center gap-3 py-2">
                  <PlayerLink id={c.playerId} name={c.playerName} className="font-medium text-chalk truncate" />
                  <span className="text-sm tabular-nums text-chalk-muted">
                    {shown(c.before)} → <span className="text-chalk">{shown(c.after)}</span>
                  </span>
                  <span
                    className={cn(
                      'text-right font-display text-lg font-extrabold tabular-nums',
                      c.delta > 0 ? 'text-win' : c.delta < 0 ? 'text-loss' : 'text-chalk-faint',
                    )}
                  >
                    {shownDelta(c)}
                  </span>
                </li>
              ))}
            </ol>
          )}

          {data.firstRatings.length > 0 && (
            <p className="text-sm text-chalk-muted">
              First rated after this cup:{' '}
              {data.firstRatings.map((f, i) => (
                <span key={f.playerId}>
                  {i > 0 && ', '}
                  <PlayerLink id={f.playerId} name={f.playerName} className="text-chalk" />{' '}
                  <span className="tabular-nums text-chalk-faint">{shown(f.after)}</span>
                </span>
              ))}
            </p>
          )}

          {mixedScales && (
            <p className="text-xs leading-relaxed text-chalk-faint">
              Ratings moved from the old 1–5 system to 0–100 at this cup, so these changes compare each player's
              old rating converted to 0–100 with their first 0–100 rating.
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmReplace}
        title="Replace saved ratings?"
        message="The ratings saved for this cup will be replaced with everyone's current ratings."
        confirmLabel="Replace ratings"
        loading={save.isPending}
        onConfirm={() => save.mutate()}
        onCancel={() => setConfirmReplace(false)}
      />
    </section>
  )
}
