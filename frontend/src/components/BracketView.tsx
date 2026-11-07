import { useEffect, useRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import type { Match } from '../types'
import { cn, fmtPhase } from '../lib/utils'
import { Empty } from './ui/States'

// Rounds of each track, earliest first
const MAIN_TRACK = [
  'PLAY-INS',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'UPPER_BRACKET_QUARTER_FINALS',
  'SEMIFINALS',
  'UPPER_BRACKET_SEMIFINALS',
  'UPPER_BRACKET_FINALS',
  'FINALS',
]
const LOWER_TRACK = ['ROUND_1_LOWER', 'ROUND_2_LOWER', 'ROUND_3_LOWER', 'LOWER_BRACKET_FINALS']

// Geometry (px)
const CARD_W = 176
const CARD_H = 74
const COL_GAP = 40
const ROW_GAP = 18
const HEADER_H = 34
const CHAMP_W = 168

const winnerOf = (m: Match) => m.winnerId ?? null

// ── Match card ────────────────────────────────────────────────────────────────

function Card({
  match,
  highlight,
  onSelect,
  style,
}: {
  match: Match
  /** 'final' gives the winner a gold score */
  highlight?: 'final'
  onSelect?: (m: Match) => void
  style?: React.CSSProperties
}) {
  const hasPens = match.participants.some(p => (p.penaltyShootoutGoals ?? 0) > 0)
  const done = !!match.winnerId

  const row = (p: Match['participants'][number] | undefined) => {
    const wins = !!p && done && match.winnerId === p.id
    return (
      <div className={cn('flex-1 flex items-center gap-2 px-3', wins && 'bg-chalk/[0.045]')}>
        <span className={cn('flex-1 truncate text-[13px]', wins ? 'font-semibold text-chalk' : 'text-chalk-faint')}>
          {p?.name ?? 'TBD'}
        </span>
        {hasPens && <span className="text-[11px] tabular-nums text-chalk-faint">({p?.penaltyShootoutGoals ?? 0})</span>}
        <span
          className={cn(
            'font-display text-xl font-extrabold tabular-nums w-5 text-right leading-none',
            wins ? (highlight === 'final' ? 'text-gold' : 'text-chalk') : 'text-chalk-faint',
          )}
        >
          {p?.goals ?? 0}
        </span>
      </div>
    )
  }

  const cls = cn(
    'absolute flex flex-col text-left rounded-lg overflow-hidden bg-turf-bg border divide-y divide-turf-line/70',
    highlight === 'final' && done ? 'border-gold/50 shadow-[0_0_0_3px_rgba(242,193,78,0.08)]' : 'border-turf-line',
    onSelect && 'hover:border-chalk-faint transition-colors cursor-pointer focus-visible:z-10',
  )
  const body = (
    <>
      {row(match.participants[0])}
      {row(match.participants[1])}
    </>
  )
  const size = { width: CARD_W, height: CARD_H, ...style }

  return onSelect ? (
    <button
      type="button"
      onClick={() => onSelect(match)}
      aria-label={`Edit ${match.participants[0]?.name ?? ''} vs ${match.participants[1]?.name ?? ''}`}
      className={cls}
      style={size}
    >
      {body}
    </button>
  ) : (
    <div className={cls} style={size}>
      {body}
    </div>
  )
}

// ── Layout ────────────────────────────────────────────────────────────────────

interface Placed {
  match: Match
  col: number
  y: number
}

interface TrackLayout {
  columns: { phase: string; matches: Placed[] }[]
  /** feeder → next match */
  edges: Array<{ from: Placed; to: Placed }>
  height: number
}

/**
 * Lays a track out as a tree. Matches carry no "next match" link, so a match
 * is taken to feed the next-round match its winner appears in. Rounds are
 * ordered from the last one backwards (feeders sit next to each other), then
 * placed from the first one forwards (each match centred on its feeders).
 */
function layoutTrack(rounds: { phase: string; matches: Match[] }[]): TrackLayout {
  const n = rounds.length
  const ordered: Match[][] = rounds.map(r => [...r.matches])

  const feedersOf = (m: Match, prev: Match[]) =>
    m.participants.map(p => prev.find(f => winnerOf(f) === p.id)).filter((f): f is Match => !!f)

  for (let r = n - 2; r >= 0; r--) {
    const used = new Set<string>()
    const next: Match[] = []
    for (const m of ordered[r + 1]!) {
      for (const f of feedersOf(m, ordered[r]!)) {
        if (!used.has(f.id)) {
          used.add(f.id)
          next.push(f)
        }
      }
    }
    for (const m of ordered[r]!) if (!used.has(m.id)) next.push(m)
    ordered[r] = next
  }

  const step = CARD_H + ROW_GAP
  const placedBy = new Map<string, Placed>()
  const columns: TrackLayout['columns'] = []
  const edges: TrackLayout['edges'] = []

  ordered.forEach((matches, col) => {
    let lastY = -Infinity
    const placed = matches.map(m => {
      const feeders = col > 0 ? feedersOf(m, ordered[col - 1]!).map(f => placedBy.get(f.id)!) : []
      let y = feeders.length
        ? feeders.reduce((s, f) => s + f.y, 0) / feeders.length
        : lastY === -Infinity
          ? 0
          : lastY + step
      y = Math.max(y, lastY + step)
      lastY = y
      const p: Placed = { match: m, col, y }
      placedBy.set(m.id, p)
      feeders.forEach(f => edges.push({ from: f, to: p }))
      return p
    })
    columns.push({ phase: rounds[col]!.phase, matches: placed })
  })

  const height = Math.max(CARD_H, ...[...placedBy.values()].map(p => p.y + CARD_H))
  return { columns, edges, height }
}

const colX = (col: number) => col * (CARD_W + COL_GAP)

function Connectors({
  edges,
  width,
  height,
  extra,
}: {
  edges: TrackLayout['edges']
  width: number
  height: number
  extra?: React.ReactNode
}) {
  return (
    <svg
      className="absolute left-0 pointer-events-none"
      style={{ top: HEADER_H }}
      width={width}
      height={height}
      aria-hidden="true"
    >
      {edges.map(({ from, to }, i) => {
        const x1 = colX(from.col) + CARD_W
        const y1 = from.y + CARD_H / 2
        const x2 = colX(to.col)
        const y2 = to.y + CARD_H / 2
        const mid = x1 + COL_GAP / 2
        return (
          <path
            key={i}
            d={`M${x1},${y1} H${mid} V${y2} H${x2}`}
            fill="none"
            stroke="#264638"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )
      })}
      {extra}
    </svg>
  )
}

// ── Tracks ────────────────────────────────────────────────────────────────────

/** True while there's more content to the right; drives a fade that hints at scrolling. */
function useMoreToRight() {
  const ref = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return { ref, more }
}

function Track({
  title,
  note,
  rounds,
  onSelect,
  thirdPlace,
  accent,
}: {
  title?: string
  note?: string
  rounds: { phase: string; matches: Match[] }[]
  onSelect?: (m: Match) => void
  thirdPlace?: Match
  accent: string
}) {
  const layout = layoutTrack(rounds)
  const scroller = useMoreToRight()
  const lastCol = layout.columns.length - 1
  const final = layout.columns[lastCol]?.phase === 'FINALS' ? layout.columns[lastCol]!.matches[0] : undefined
  const champion = final?.match.winnerId ? final.match.participants.find(p => p.id === final.match.winnerId) : undefined

  const thirdY = layout.height + 44
  const bodyHeight = thirdPlace ? thirdY + CARD_H : layout.height
  const width = colX(layout.columns.length) - COL_GAP + (champion ? COL_GAP + CHAMP_W : 0)
  const champX = colX(lastCol) + CARD_W + COL_GAP

  return (
    <section>
      {title && (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
          <h4 className={cn('font-display text-xl font-bold', accent)}>{title}</h4>
          {note && <p className="text-xs text-chalk-faint">{note}</p>}
        </div>
      )}
      <div className="relative">
        <div ref={scroller.ref} className="overflow-x-auto scrollbar-thin pb-2">
          <div className="relative" style={{ width, height: HEADER_H + bodyHeight }}>
            {layout.columns.map((c, i) => (
              <p
                key={c.phase}
                className={cn(
                  'absolute top-0 text-xs font-semibold',
                  c.phase === 'FINALS' ? 'text-gold' : 'text-chalk-muted',
                )}
                style={{ left: colX(i), width: CARD_W }}
              >
                {fmtPhase(c.phase)}
                <span className="ml-1.5 font-normal text-chalk-faint tabular-nums">
                  {c.matches.length > 1 ? c.matches.length : ''}
                </span>
              </p>
            ))}

            <Connectors
              edges={layout.edges}
              width={width}
              height={bodyHeight}
              extra={
                final && champion ? (
                  <path
                    d={`M${colX(lastCol) + CARD_W},${final.y + CARD_H / 2} H${champX}`}
                    stroke="#F2C14E"
                    strokeOpacity={0.6}
                    strokeWidth={1.5}
                  />
                ) : null
              }
            />

            <div className="absolute left-0 right-0" style={{ top: HEADER_H }}>
              {layout.columns.flatMap(c =>
                c.matches.map(p => (
                  <Card
                    key={p.match.id}
                    match={p.match}
                    highlight={c.phase === 'FINALS' ? 'final' : undefined}
                    onSelect={onSelect}
                    style={{ left: colX(p.col), top: p.y }}
                  />
                )),
              )}

              {final && champion && (
                <div
                  className="absolute flex flex-col justify-center rounded-xl border border-gold/50 bg-[linear-gradient(140deg,rgba(242,193,78,0.16),rgba(242,193,78,0.03))] px-4"
                  style={{
                    left: champX,
                    top: final.y - 8,
                    width: CHAMP_W,
                    height: CARD_H + 16,
                  }}
                >
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <Trophy className="w-3.5 h-3.5" /> Champion
                  </p>
                  <p className="font-display text-2xl font-black leading-tight text-chalk truncate mt-0.5">
                    {champion.name}
                  </p>
                </div>
              )}

              {thirdPlace && (
                <>
                  <p
                    className="absolute text-xs font-semibold text-bronze"
                    style={{ left: colX(lastCol), top: thirdY - 22 }}
                  >
                    Third place
                  </p>
                  <Card match={thirdPlace} onSelect={onSelect} style={{ left: colX(lastCol), top: thirdY }} />
                </>
              )}
            </div>
          </div>
        </div>
        {scroller.more && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-turf-surface to-transparent"
          />
        )}
      </div>
    </section>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

interface BracketViewProps {
  matches: Match[]
  /** Makes each match clickable, e.g. to edit it */
  onSelect?: (match: Match) => void
}

export default function BracketView({ matches, onSelect }: BracketViewProps) {
  const byPhase = new Map<string, Match[]>()
  matches.forEach(m => byPhase.set(m.matchPhase, [...(byPhase.get(m.matchPhase) ?? []), m]))

  const rounds = (phases: string[]) =>
    phases.filter(p => byPhase.has(p)).map(phase => ({ phase, matches: byPhase.get(phase)! }))

  const main = rounds(MAIN_TRACK)
  const lower = rounds(LOWER_TRACK)
  const groups = byPhase.get('GROUP_STAGE') ?? []
  const thirdPlace = byPhase.get('THIRD_PLACE')?.[0]
  const doubleElim = lower.length > 0 || main.some(r => r.phase.startsWith('UPPER_BRACKET'))

  if (matches.length === 0) return <Empty title="No matches yet" />

  return (
    <div className="space-y-8">
      {groups.length > 0 && (
        <section>
          <h4 className="font-display text-xl font-bold text-chalk-muted mb-3">
            Group stage <span className="text-sm font-sans font-normal text-chalk-faint">{groups.length} matches</span>
          </h4>
          <div className="flex flex-wrap gap-3">
            {groups.map(m => (
              <div key={m.id} className="relative" style={{ width: CARD_W, height: CARD_H }}>
                <Card match={m} onSelect={onSelect} style={{ left: 0, top: 0 }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {main.length > 0 && (
        <Track
          title={doubleElim ? 'Upper bracket' : groups.length ? 'Knockout' : undefined}
          note={doubleElim ? 'Winners stay here; the final is the grand final.' : undefined}
          rounds={main}
          onSelect={onSelect}
          thirdPlace={thirdPlace}
          accent="text-chalk"
        />
      )}

      {lower.length > 0 && (
        <Track
          title="Lower bracket"
          note="A second chance for upper-bracket losers; its winner plays the grand final."
          rounds={lower}
          onSelect={onSelect}
          accent="text-lower"
        />
      )}

      {onSelect && <p className="text-xs text-chalk-faint">Select a match to edit it.</p>}
    </div>
  )
}
