import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Trophy, X } from 'lucide-react'
import type { Match } from '../types'
import { cn, fmtPhase } from '../lib/utils'
import { Empty } from './ui/States'
import Sponsor from './Sponsor'

// Rounds of each track, earliest first
const MAIN_TRACK = [
  'PLAY-INS',
  'ROUND_OF_32',
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
const CARD_W = 164
const CARD_H = 64
const COL_GAP = 40
const ROW_GAP = 18
const HEADER_H = 34
const CHAMP_W = 168
// Two-sided bracket
const SIDE_GAP = 26
const CENTER_W = 196
const CHAMP_H = 92

const winnerOf = (m: Match) => m.winnerId ?? null

// ── Match card ────────────────────────────────────────────────────────────────

/** A scoreboard-style match: names on the left, score boxes on the right, the winner's lit up. */
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
      <div className="flex-1 flex items-stretch min-h-0">
        <span
          className={cn(
            'flex-1 flex items-center px-2.5 truncate text-[13px]',
            wins ? 'font-semibold text-chalk bg-turf-raised' : 'text-chalk-muted bg-turf-surface',
          )}
        >
          <span className="truncate">{p?.name ?? 'TBD'}</span>
        </span>
        {hasPens && (
          <span
            title="Penalty shootout"
            className={cn(
              'w-7 grid place-items-center text-[12px] tabular-nums bg-turf-bg',
              wins ? 'text-chalk font-semibold' : 'text-chalk-faint',
            )}
          >
            {p?.penaltyShootoutGoals ?? 0}
          </span>
        )}
        <span
          className={cn(
            'w-9 grid place-items-center font-display text-xl font-extrabold tabular-nums leading-none',
            wins
              ? highlight === 'final'
                ? 'bg-gold text-turf-bg'
                : 'bg-chalk text-turf-bg'
              : 'bg-turf-bg text-chalk-faint',
          )}
        >
          {p?.goals ?? 0}
        </span>
      </div>
    )
  }

  const cls = cn(
    'absolute flex flex-col gap-px text-left rounded-md overflow-hidden bg-turf-line border',
    highlight === 'final' && done ? 'border-gold/60 shadow-[0_0_0_3px_rgba(242,193,78,0.10)]' : 'border-turf-line',
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

/**
 * Whether there's more content to either side; drives fades that hint at
 * scrolling. `centre` starts the scroll in the middle (for the two-sided poster).
 */
function useMoreToRight(centre = false) {
  const ref = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState(false)
  const [moreLeft, setMoreLeft] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
      setMoreLeft(el.scrollLeft > 4)
    }
    if (centre) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { ref, more, moreLeft }
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

// ── Two-sided bracket ─────────────────────────────────────────────────────────

/** An original gold cup, drawn here so the bracket has a centrepiece. */
function TrophyArt({ size = 92 }: { size?: number }) {
  return (
    <svg width={size * 0.8} height={size} viewBox="0 0 64 80" aria-hidden="true">
      <defs>
        <linearGradient id="trophy-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#A8781F" />
          <stop offset="0.45" stopColor="#F9DC7C" />
          <stop offset="0.7" stopColor="#F2C14E" />
          <stop offset="1" stopColor="#B9852A" />
        </linearGradient>
      </defs>
      <path d="M15 10H6v5c0 9 6 14 12 15" fill="none" stroke="url(#trophy-gold)" strokeWidth="4" strokeLinecap="round" />
      <path d="M49 10h9v5c0 9-6 14-12 15" fill="none" stroke="url(#trophy-gold)" strokeWidth="4" strokeLinecap="round" />
      <path d="M13 5h38v15c0 13-8.5 23-19 23S13 33 13 20z" fill="url(#trophy-gold)" />
      <path d="M19 9h4v11c0 7 3 12 7 15-6-1-11-7-11-15z" fill="#FFF3C4" opacity="0.45" />
      <rect x="28" y="42" width="8" height="11" fill="url(#trophy-gold)" />
      <path d="M21 53h22l3 8H18z" fill="url(#trophy-gold)" />
      <rect x="14" y="61" width="36" height="13" rx="2" fill="#5E4415" />
      <rect x="19" y="65" width="26" height="4" rx="1" fill="#F2C14E" opacity="0.55" />
    </svg>
  )
}

/**
 * Splits the rounds before the final into the half that feeds each finalist,
 * by following each match's winner forward. Matches that can't be traced
 * (unfinished or inconsistent results) fill the smaller half.
 */
function splitHalves(rounds: { phase: string; matches: Match[] }[], final: Match) {
  const half = new Map<string, 0 | 1>()
  for (let r = rounds.length - 1; r >= 0; r--) {
    const counts = [0, 0]
    const unplaced: Match[] = []
    for (const m of rounds[r]!.matches) {
      const w = winnerOf(m)
      let side: 0 | 1 | undefined
      if (r === rounds.length - 1) {
        const i = final.participants.findIndex(p => p.id === w)
        side = i === 0 ? 0 : i === 1 ? 1 : undefined
      } else {
        const next = rounds[r + 1]!.matches.find(x => x.participants.some(p => p.id === w))
        side = next ? half.get(next.id) : undefined
      }
      if (side === undefined) unplaced.push(m)
      else {
        half.set(m.id, side)
        counts[side]!++
      }
    }
    for (const m of unplaced) {
      const side = counts[0]! <= counts[1]! ? 0 : 1
      half.set(m.id, side)
      counts[side]!++
    }
  }
  const pick = (side: 0 | 1) => rounds.map(r => ({ phase: r.phase, matches: r.matches.filter(m => half.get(m.id) === side) }))
  return [pick(0), pick(1)] as const
}

/**
 * A poster-style bracket: one half runs left to right, the other right to
 * left, and both meet at the final under the trophy in the middle.
 */
function TwoSidedTrack({
  rounds,
  onSelect,
  thirdPlace,
}: {
  rounds: { phase: string; matches: Match[] }[]
  onSelect?: (m: Match) => void
  thirdPlace?: Match
}) {
  const final = rounds[rounds.length - 1]!.matches[0]!
  const before = rounds.slice(0, -1)
  const [leftRounds, rightRounds] = splitHalves(before, final)
  const left = layoutTrack(leftRounds)
  const right = layoutTrack(rightRounds)
  const cols = before.length
  const scroller = useMoreToRight(true)

  const champion = final.winnerId ? final.participants.find(p => p.id === final.winnerId) : undefined

  // Line both halves up so their last matches sit level with the final
  const lastY = (l: TrackLayout) => l.columns[cols - 1]?.matches[0]?.y
  const TOP = 152 // "Final" label and the trophy above the final card
  const anchor = Math.max(lastY(left) ?? 0, lastY(right) ?? 0, TOP)
  const offL = anchor - (lastY(left) ?? anchor)
  const offR = anchor - (lastY(right) ?? anchor)

  // Each half only takes as many columns as it has rounds with matches,
  // counted out from the centre (a half full of byes stays narrow)
  const span = (l: TrackLayout) => {
    const first = l.columns.findIndex(c => c.matches.length > 0)
    return first === -1 ? 0 : cols - first
  }
  const step = CARD_W + SIDE_GAP
  const leftSpan = span(left)
  const rightSpan = span(right)
  const centerX = leftSpan * step
  const finalX = centerX + (CENTER_W - CARD_W) / 2
  const leftX = (col: number) => (col - (cols - leftSpan)) * step
  const rightX = (col: number) => centerX + CENTER_W + SIDE_GAP + (cols - 1 - col) * step
  const width = centerX + CENTER_W + rightSpan * step

  const champTop = anchor + CARD_H + 14
  const thirdTop = champTop + (champion ? CHAMP_H - 16 : 0) + 34
  const height = Math.max(
    left.height + offL,
    right.height + offR,
    thirdPlace ? thirdTop + CARD_H : champTop + (champion ? CHAMP_H - 16 : 0),
  )

  const edge = (x1: number, y1: number, x2: number, y2: number, key: string, gold = false) => {
    const mid = (x1 + x2) / 2
    return (
      <path
        key={key}
        d={`M${x1},${y1} H${mid} V${y2} H${x2}`}
        fill="none"
        stroke={gold ? '#F2C14E' : '#3A5E4D'}
        strokeOpacity={gold ? 0.7 : 1}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    )
  }
  const mid = (y: number) => y + CARD_H / 2

  const labels = (l: TrackLayout, x: (c: number) => number, align: 'left' | 'right') =>
    l.columns.map((c, i) =>
      c.matches.length ? (
        <p
          key={`${align}-${c.phase}`}
          className={cn('absolute top-0 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk-muted', align === 'right' && 'text-right')}
          style={{ left: x(i), width: CARD_W }}
        >
          {fmtPhase(c.phase)}
        </p>
      ) : null,
    )

  const cards = (l: TrackLayout, x: (c: number) => number, off: number) =>
    l.columns.flatMap(c =>
      c.matches.map(p => (
        <Card key={p.match.id} match={p.match} onSelect={onSelect} style={{ left: x(p.col), top: p.y + off }} />
      )),
    )

  return (
    <div className="relative">
      <div ref={scroller.ref} className="overflow-x-auto scrollbar-thin pb-2">
        <div className="relative mx-auto" style={{ width, height: HEADER_H + height }}>
          {labels(left, leftX, 'left')}
          {labels(right, rightX, 'right')}

          <svg className="absolute left-0 pointer-events-none" style={{ top: HEADER_H }} width={width} height={height} aria-hidden="true">
            {left.edges.map(({ from, to }, i) =>
              edge(leftX(from.col) + CARD_W, mid(from.y + offL), leftX(to.col), mid(to.y + offL), `l${i}`),
            )}
            {right.edges.map(({ from, to }, i) =>
              edge(rightX(from.col), mid(from.y + offR), rightX(to.col) + CARD_W, mid(to.y + offR), `r${i}`),
            )}
            {left.columns[cols - 1]?.matches.map(p =>
              edge(leftX(cols - 1) + CARD_W, mid(p.y + offL), finalX, mid(anchor), `lf${p.match.id}`, true),
            )}
            {right.columns[cols - 1]?.matches.map(p =>
              edge(rightX(cols - 1), mid(p.y + offR), finalX + CARD_W, mid(anchor), `rf${p.match.id}`, true),
            )}
          </svg>

          <div className="absolute left-0 right-0" style={{ top: HEADER_H }}>
            {cards(left, leftX, offL)}
            {cards(right, rightX, offR)}

            {/* Centre: "Final", the trophy, the final, the champion */}
            <div className="absolute flex flex-col items-center" style={{ left: centerX, width: CENTER_W, top: anchor - TOP }}>
              <p className="font-display text-2xl font-black uppercase tracking-[0.3em] text-chalk pl-[0.3em]">Final</p>
              <div className="mt-1 drop-shadow-[0_6px_18px_rgba(242,193,78,0.35)]">
                <TrophyArt />
              </div>
            </div>
            <Card match={final} highlight="final" onSelect={onSelect} style={{ left: finalX, top: anchor }} />

            {champion && (
              <div
                className="absolute flex flex-col items-center justify-center text-center rounded-xl border border-gold/50 bg-[linear-gradient(160deg,rgba(242,193,78,0.20),rgba(242,193,78,0.04))] px-3"
                style={{ left: finalX, top: champTop, width: CARD_W, height: CHAMP_H - 16 }}
              >
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                  <Trophy className="w-3.5 h-3.5" /> Champion
                </p>
                <p className="font-display text-[1.7rem] font-black leading-tight text-chalk truncate max-w-full">{champion.name}</p>
              </div>
            )}

            {thirdPlace && (
              <>
                <p
                  className="absolute text-center text-[11px] font-bold uppercase tracking-[0.14em] text-bronze"
                  style={{ left: finalX, width: CARD_W, top: thirdTop - 20 }}
                >
                  Third place
                </p>
                <Card match={thirdPlace} onSelect={onSelect} style={{ left: finalX, top: thirdTop }} />
              </>
            )}
          </div>
        </div>
      </div>
      {scroller.moreLeft && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-2 w-16 bg-gradient-to-r from-turf-surface to-transparent"
        />
      )}
      {scroller.more && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-turf-surface to-transparent"
        />
      )}
    </div>
  )
}

/** The poster's title band: the cup's name, and the sponsor in the corner. */
function PosterHeader({ title }: { title?: string }) {
  return (
    <div className="relative flex flex-col items-center gap-4 sm:block pb-6">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-gold pl-[0.35em]">Bracket</p>
        {title && (
          <h4 className="font-display text-4xl sm:text-5xl font-black uppercase leading-none text-chalk mt-1.5">{title}</h4>
        )}
      </div>
      <div className="sm:absolute sm:right-0 sm:top-0">
        <Sponsor />
      </div>
    </div>
  )
}

// ── Poster and full screen ────────────────────────────────────────────────────

const POSTER_CLS =
  'rounded-2xl border border-turf-line bg-turf-surface bg-[radial-gradient(ellipse_at_50%_35%,rgba(242,193,78,0.07),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent)] px-4 sm:px-6 pt-6 pb-4'

/** Scales its content to fit the space it's given, centred, with no scrolling. */
function FitToSpace({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const fit = () =>
      setScale(Math.min(o.clientWidth / i.offsetWidth, o.clientHeight / i.offsetHeight, 1.75))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={outer} className="relative flex-1 min-h-0 overflow-hidden">
      <div
        ref={inner}
        className="absolute left-1/2 top-1/2 w-max"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}

/** The bracket on its own over the whole screen, scaled to fit. */
function FullScreenBracket({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    // Use the browser's real full screen where allowed; the overlay works either way
    el?.requestFullscreen?.().catch(() => undefined)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    // Leaving the browser's full screen (e.g. with Esc) closes the overlay too
    const onFsChange = () => !document.fullscreenElement && onClose()
    document.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFsChange)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLButtonElement>('[data-close]')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFsChange)
      document.body.style.overflow = overflow
      if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Bracket, full screen"
      className="fixed inset-0 z-50 flex flex-col bg-turf-bg p-3 sm:p-6"
    >
      <button
        type="button"
        data-close
        onClick={onClose}
        aria-label="Close full screen"
        className="absolute right-3 top-3 sm:right-5 sm:top-5 z-10 grid place-items-center w-10 h-10 rounded-full border border-turf-line bg-turf-surface text-chalk-muted hover:text-chalk hover:border-chalk-faint transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <FitToSpace>{children}</FitToSpace>
    </div>,
    document.body,
  )
}

function Poster({
  title,
  rounds,
  onSelect,
  thirdPlace,
}: {
  title?: string
  rounds: { phase: string; matches: Match[] }[]
  onSelect?: (m: Match) => void
  thirdPlace?: Match
}) {
  const [full, setFull] = useState(false)
  const close = useCallback(() => setFull(false), [])
  return (
    <>
      <section className={cn(POSTER_CLS, 'relative')}>
        <button
          type="button"
          onClick={() => setFull(true)}
          className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10 inline-flex items-center gap-1.5 rounded-lg border border-turf-line bg-turf-bg/60 px-2.5 py-1.5 text-xs font-medium text-chalk-muted hover:text-chalk hover:border-chalk-faint transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Full screen</span>
          <span className="sr-only sm:hidden">Full screen</span>
        </button>
        <PosterHeader title={title} />
        <TwoSidedTrack rounds={rounds} onSelect={onSelect} thirdPlace={thirdPlace} />
      </section>

      {full && (
        <FullScreenBracket onClose={close}>
          {/* Read-only here: editing a match from full screen would open behind it */}
          <section className={POSTER_CLS}>
            <PosterHeader title={title} />
            <TwoSidedTrack rounds={rounds} thirdPlace={thirdPlace} />
          </section>
        </FullScreenBracket>
      )}
    </>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

interface BracketViewProps {
  matches: Match[]
  /** Makes each match clickable, e.g. to edit it */
  onSelect?: (match: Match) => void
  /** The cup's name, shown as the bracket's title */
  title?: string
}

export default function BracketView({ matches, onSelect, title }: BracketViewProps) {
  const byPhase = new Map<string, Match[]>()
  matches.forEach(m => byPhase.set(m.matchPhase, [...(byPhase.get(m.matchPhase) ?? []), m]))

  const rounds = (phases: string[]) =>
    phases.filter(p => byPhase.has(p)).map(phase => ({ phase, matches: byPhase.get(phase)! }))

  const main = rounds(MAIN_TRACK)
  const lower = rounds(LOWER_TRACK)
  const groups = byPhase.get('GROUP_STAGE') ?? []
  const thirdPlace = byPhase.get('THIRD_PLACE')?.[0]
  const doubleElim = lower.length > 0 || main.some(r => r.phase.startsWith('UPPER_BRACKET'))
  // A single bracket ending in one final is drawn as a two-sided poster
  const lastRound = main[main.length - 1]
  const twoSided = !doubleElim && main.length >= 2 && lastRound?.phase === 'FINALS' && lastRound.matches.length === 1

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

      {twoSided ? (
        <Poster title={title} rounds={main} onSelect={onSelect} thirdPlace={thirdPlace} />
      ) : main.length > 0 && (
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
