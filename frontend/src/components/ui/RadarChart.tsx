interface RadarAxis {
  label: string
  value: number
}

interface RadarChartProps {
  axes: RadarAxis[]
  size?: number
}

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

  const dataStr = axes
    .map((a, i) => {
      const p = pt(i, r * (Math.max(0, Math.min(100, a.value)) / 100))
      return `${p.x},${p.y}`
    })
    .join(' ')

  const pad = 28 // extra space so edge labels never get clipped

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
      aria-hidden="true"
    >
      {/* Grid rings */}
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon
          key={pct}
          points={polyStr(r * (pct / 100))}
          fill="none"
          stroke="#30363d"
          strokeWidth={pct === 100 ? 1 : 0.5}
        />
      ))}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const p = pt(i, r)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#30363d"
            strokeWidth="0.5"
          />
        )
      })}

      {/* Data area */}
      <polygon
        points={dataStr}
        fill="rgba(63,185,80,0.18)"
        stroke="#3fb950"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {axes.map((a, i) => {
        const p = pt(i, r * (Math.max(0, Math.min(100, a.value)) / 100))
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#3fb950" />
      })}

      {/* Labels */}
      {axes.map((a, i) => {
        const p = pt(i, r + 18)
        const anchor =
          p.x < cx - 4 ? 'end' : p.x > cx + 4 ? 'start' : 'middle'
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="9"
            fill="#8b949e"
            fontFamily="system-ui, sans-serif"
          >
            {a.label}
          </text>
        )
      })}

      {/* Value labels at dots */}
      {axes.map((a, i) => {
        const p = pt(i, r * (Math.max(0, Math.min(100, a.value)) / 100))
        return (
          <text
            key={`v${i}`}
            x={p.x}
            y={p.y - 6}
            textAnchor="middle"
            fontSize="8"
            fill="#3fb950"
            fontFamily="system-ui, sans-serif"
            fontWeight="bold"
          >
            {a.value}
          </text>
        )
      })}
    </svg>
  )
}
