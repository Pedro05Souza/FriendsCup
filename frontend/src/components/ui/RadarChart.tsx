interface RadarAxis {
  label: string
  value: number
}

interface RadarChartProps {
  axes: RadarAxis[]
  size?: number
}

const LINE = '#264638'
const GOLD = '#F2C14E'
const MUTED = '#A3B8AC'

export default function RadarChart({ axes, size = 200 }: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const n = axes.length

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const angle = (i: number) => toRad(-90 + (360 / n) * i)

  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  })

  const polyStr = (radius: number) =>
    axes.map((_, i) => `${pt(i, radius).x},${pt(i, radius).y}`).join(' ')

  const clamp = (v: number) => Math.max(0, Math.min(100, v))

  const dataStr = axes
    .map((a, i) => {
      const p = pt(i, r * (clamp(a.value) / 100))
      return `${p.x},${p.y}`
    })
    .join(' ')

  const pad = 30 // extra space so edge labels never get clipped

  return (
    <svg
      width={size + pad * 2}
      height={size + pad * 2}
      viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
      aria-hidden="true"
    >
      {[25, 50, 75, 100].map((pct) => (
        <polygon
          key={pct}
          points={polyStr(r * (pct / 100))}
          fill="none"
          stroke={LINE}
          strokeWidth={pct === 100 ? 1.2 : 0.7}
        />
      ))}

      {axes.map((_, i) => {
        const p = pt(i, r)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={LINE} strokeWidth="0.7" />
      })}

      <polygon
        points={dataStr}
        fill="rgba(242,193,78,0.16)"
        stroke={GOLD}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {axes.map((a, i) => {
        const p = pt(i, r * (clamp(a.value) / 100))
        return <circle key={i} cx={p.x} cy={p.y} r={2.75} fill={GOLD} />
      })}

      {axes.map((a, i) => {
        const p = pt(i, r + 20)
        const anchor = p.x < cx - 4 ? 'end' : p.x > cx + 4 ? 'start' : 'middle'
        return (
          <g key={i}>
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="9.5"
              fill={MUTED}
              fontFamily="Figtree, system-ui, sans-serif"
            >
              {a.label}
            </text>
            <text
              x={p.x}
              y={p.y + 7}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="800"
              fill="#EEF3EF"
              fontFamily='"Big Shoulders Display", Impact, sans-serif'
            >
              {a.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
