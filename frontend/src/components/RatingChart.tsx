import { useEffect, useRef, useState } from 'react'
import type { RatingPoint } from '../types'
import { fmtCup, fmtDate } from '../lib/utils'

const GOLD = '#F2C14E'
const SURFACE = '#11281E'
const GRID = '#264638'
const MUTED = '#A3B8AC'
const FAINT = '#6E8A7C'

const HEIGHT = 250
const PAD = { top: 26, right: 40, bottom: 52, left: 40 }

interface ChartPoint {
  key: string
  label: string
  sublabel: string
  overall: number
  /** Converted from the old 1-5 system */
  legacy: boolean
  point?: RatingPoint
  isNow?: boolean
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry!.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

/** Nice round ticks every 5 or 10 between lo and hi. */
function ticks(lo: number, hi: number) {
  const step = hi - lo > 30 ? 10 : 5
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v)
  return out
}

function Tooltip({ p }: { p: ChartPoint }) {
  const r = p.point
  return (
    <div className="rounded-lg border border-turf-line bg-turf-raised px-3 py-2 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] min-w-[150px]">
      <p className="font-display text-2xl font-extrabold leading-none text-chalk tabular-nums">{p.overall}</p>
      <p className="text-xs font-semibold text-chalk-muted mt-1">{p.isNow ? 'Rating now' : `After ${p.label}`}</p>
      {p.sublabel && <p className="text-[11px] text-chalk-faint">{p.sublabel}</p>}
      {r?.scale === 'LEGACY_5' && (
        <p className="text-[11px] text-chalk-faint mt-1.5">
          <span className="text-chalk tabular-nums">{r.rawOverall.toFixed(1)}</span> on the old 1–5 scale
        </p>
      )}
      {r && r.scale === 'POINTS_100' && r.attack !== null && (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5 text-[11px] tabular-nums">
          {(
            [
              ['Attack', r.attack],
              ['Defense', r.defense],
              ['Intelligence', r.intelligence],
              ['Mentality', r.mentality],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-chalk-faint">{k}</dt>
              <dd className="text-chalk text-right">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

/**
 * A player's overall after each cup, plus where it stands now. Cups are evenly
 * spaced (they're irregular in time). Hollow markers are ratings converted from
 * the old 1-5 system; a hairline marks where the 0-100 system starts.
 */
export default function RatingChart({
  snapshots,
  current,
}: {
  snapshots: RatingPoint[]
  current: number
}) {
  const { ref, width } = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const points: ChartPoint[] = [
    ...snapshots.map((s, i) => ({
      key: `${s.championshipId ?? 'x'}-${i}`,
      label: s.championshipTitle ? fmtCup(s.championshipTitle) : 'Unknown cup',
      sublabel: fmtDate(s.takenAtIso),
      overall: s.overall,
      legacy: s.scale === 'LEGACY_5',
      point: s,
    })),
    { key: 'now', label: 'Now', sublabel: '', overall: current, legacy: false, isNow: true },
  ]

  const values = points.map(p => p.overall)
  const lo = Math.max(0, Math.floor((Math.min(...values) - 4) / 5) * 5)
  const hi = Math.min(100, Math.ceil((Math.max(...values) + 4) / 5) * 5)
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo || 1)) * innerH
  const firstNew = points.findIndex(p => p.point?.scale === 'POINTS_100')
  const switchX = firstNew > 0 && points[firstNew - 1]?.legacy ? (x(firstNew - 1) + x(firstNew)) / 2 : null
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.overall)}`).join(' ')
  const last = points.length - 1
  const peak = values.indexOf(Math.max(...values))

  const nearest = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left
    let best = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i
    })
    return best
  }

  return (
    <div>
      <div ref={ref} className="relative select-none">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`Overall rating after each cup, from ${points[0]!.overall} to ${current} now`}
            tabIndex={0}
            className="block focus-visible:outline-none"
            onPointerMove={e => setActive(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
            onPointerLeave={() => setActive(null)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') setActive(a => Math.min(last, (a ?? -1) + 1))
              if (e.key === 'ArrowLeft') setActive(a => Math.max(0, (a ?? points.length) - 1))
              if (e.key === 'Escape') setActive(null)
            }}
            onBlur={() => setActive(null)}
          >
            {/* Grid and y ticks */}
            {ticks(lo, hi).map(t => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
                <text x={PAD.left - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={FAINT}>
                  {t}
                </text>
              </g>
            ))}

            {/* Where the 0-100 system starts */}
            {switchX !== null && (
              <g>
                <line x1={switchX} x2={switchX} y1={PAD.top - 14} y2={PAD.top + innerH} stroke={GRID} strokeWidth={1} />
                <text x={switchX + 6} y={PAD.top - 8} fontSize={10} fill={FAINT}>
                  0–100 system
                </text>
              </g>
            )}

            {/* Crosshair */}
            {active !== null && (
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke={MUTED} strokeOpacity={0.35} strokeWidth={1} />
            )}

            {/* Wash under the line */}
            <path d={`${path} L${x(last)},${PAD.top + innerH} L${x(0)},${PAD.top + innerH} Z`} fill={GOLD} fillOpacity={0.08} />
            <path d={path} fill="none" stroke={GOLD} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

            {/* Markers: solid for 0-100 ratings, hollow for converted 1-5 ones */}
            {points.map((p, i) => (
              <circle
                key={p.key}
                cx={x(i)}
                cy={y(p.overall)}
                r={active === i ? 6.5 : 5}
                fill={p.legacy ? SURFACE : GOLD}
                stroke={p.legacy ? GOLD : SURFACE}
                strokeWidth={2}
              />
            ))}

            {/* Direct labels: the latest value and the peak */}
            {[...new Set([last, peak])].map(i => (
              <text
                key={`v${i}`}
                x={x(i)}
                y={y(points[i]!.overall) - 12}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="#EEF3EF"
                fontFamily='"Big Shoulders Display", Impact, sans-serif'
              >
                {points[i]!.overall}
              </text>
            ))}

            {/* Cup labels */}
            {points.map((p, i) => (
              <g key={`l${p.key}`}>
                <text x={x(i)} y={PAD.top + innerH + 20} textAnchor="middle" fontSize={11} fontWeight={600} fill={p.isNow ? '#EEF3EF' : MUTED}>
                  {p.label}
                </text>
                <text x={x(i)} y={PAD.top + innerH + 35} textAnchor="middle" fontSize={10} fill={FAINT}>
                  {p.point ? new Date(p.point.takenAtIso).getUTCFullYear() : ''}
                </text>
              </g>
            ))}
          </svg>
        )}

        {active !== null && width > 0 && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: Math.min(Math.max(x(active) - 80, 0), width - 170),
              top: Math.max(0, y(points[active]!.overall) - 150),
            }}
          >
            <Tooltip p={points[active]!} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1 text-xs text-chalk-muted">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4.5" fill={GOLD} /></svg>
          0–100 rating
        </span>
        {points.some(p => p.legacy) && (
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" aria-hidden="true"><circle cx="6" cy="6" r="4" fill={SURFACE} stroke={GOLD} strokeWidth={2} /></svg>
            Converted from the old 1–5 rating
          </span>
        )}
      </div>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs text-chalk-faint hover:text-chalk-muted w-fit">Show as a table</summary>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-chalk-faint text-xs">
              <th className="text-left font-semibold py-1">After</th>
              <th className="text-left font-semibold py-1">Date</th>
              <th className="text-right font-semibold py-1">Overall</th>
              <th className="text-right font-semibold py-1">Original value</th>
            </tr>
          </thead>
          <tbody>
            {points.map(p => (
              <tr key={`t${p.key}`} className="border-t border-turf-line/60">
                <td className="py-1.5 text-chalk">{p.label}</td>
                <td className="py-1.5 text-chalk-faint">{p.sublabel}</td>
                <td className="py-1.5 text-right tabular-nums text-chalk">{p.overall}</td>
                <td className="py-1.5 text-right tabular-nums text-chalk-faint">
                  {p.point?.scale === 'LEGACY_5' ? `${p.point.rawOverall.toFixed(1)} (1–5)` : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
