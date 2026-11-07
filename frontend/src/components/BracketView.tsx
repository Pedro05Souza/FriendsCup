import type { Match } from '../types'
import { cn, fmtPhase } from '../lib/utils'
import { Empty } from './ui/States'

// Phase display order — left to right in the bracket
const PHASE_ORDER = [
  'GROUP_STAGE',
  'PLAY-INS',
  'ROUND_OF_16',
  'UPPER_BRACKET_QUARTER_FINALS',
  'QUARTER_FINALS',
  'ROUND_1_LOWER',
  'UPPER_BRACKET_SEMIFINALS',
  'ROUND_2_LOWER',
  'ROUND_3_LOWER',
  'UPPER_BRACKET_FINALS',
  'LOWER_BRACKET_FINALS',
  'SEMIFINALS',
  'THIRD_PLACE',
  'FINALS',
]

// Which phases belong to the "upper" or "lower" track for coloring
const UPPER_PHASES = new Set([
  'PLAY-INS',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'UPPER_BRACKET_QUARTER_FINALS',
  'UPPER_BRACKET_SEMIFINALS',
  'UPPER_BRACKET_FINALS',
  'SEMIFINALS',
])

const LOWER_PHASES = new Set([
  'ROUND_1_LOWER',
  'ROUND_2_LOWER',
  'ROUND_3_LOWER',
  'LOWER_BRACKET_FINALS',
])

function phaseAccent(phase: string) {
  if (phase === 'FINALS') return { text: 'text-gold', edge: 'border-l-gold' }
  if (phase === 'THIRD_PLACE') return { text: 'text-bronze', edge: 'border-l-bronze' }
  if (LOWER_PHASES.has(phase)) return { text: 'text-lower', edge: 'border-l-lower' }
  return { text: 'text-chalk-muted', edge: 'border-l-chalk-faint/60' }
}

// ── Single bracket card ──────────────────────────────────────────────────────

function BracketCard({ match, edge, isFinal }: { match: Match; edge: string; isFinal: boolean }) {
  const [p1, p2] = match.participants
  const p1Wins = !!match.winnerId && match.winnerId === p1?.id
  const p2Wins = !!match.winnerId && match.winnerId === p2?.id
  const hasPens = (p1?.penaltyShootoutGoals ?? 0) > 0 || (p2?.penaltyShootoutGoals ?? 0) > 0

  const row = (
    name: string | undefined,
    goals: number | undefined,
    penGoals: number | undefined,
    wins: boolean,
  ) => (
    <div className="flex items-center justify-between px-3 py-2 gap-2">
      <span className={cn('text-[13px] font-semibold truncate flex-1', wins ? 'text-chalk' : 'text-chalk-faint')}>
        {name ?? 'TBD'}
      </span>
      <div className="flex items-baseline gap-1 shrink-0">
        {hasPens && <span className="text-[11px] text-chalk-faint tabular-nums">({penGoals ?? 0})</span>}
        <span
          className={cn(
            'font-display text-xl font-extrabold tabular-nums w-5 text-right leading-none',
            wins ? (isFinal ? 'text-gold' : 'text-chalk') : 'text-chalk-faint',
          )}
        >
          {goals ?? 0}
        </span>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden mb-2.5 w-48 bg-turf-bg border border-turf-line border-l-[3px] divide-y divide-turf-line/70',
        edge,
        isFinal && match.winnerId && 'shadow-[0_0_0_1px_rgba(242,193,78,0.25)]',
      )}
    >
      {row(p1?.name, p1?.goals, p1?.penaltyShootoutGoals, p1Wins)}
      {row(p2?.name, p2?.goals, p2?.penaltyShootoutGoals, p2Wins)}
    </div>
  )
}

// ── Main bracket view ────────────────────────────────────────────────────────

interface BracketViewProps {
  matches: Match[]
}

export default function BracketView({ matches }: BracketViewProps) {
  const matchesByPhase = new Map<string, Match[]>()
  matches.forEach(m => {
    const arr = matchesByPhase.get(m.matchPhase) ?? []
    arr.push(m)
    matchesByPhase.set(m.matchPhase, arr)
  })

  const phases = PHASE_ORDER.filter(p => matchesByPhase.has(p))

  if (phases.length === 0) {
    return <Empty title="No matches yet" />
  }

  return (
    <div className="overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex gap-4 items-start" style={{ minWidth: `${phases.length * 208}px` }}>
        {phases.map(phase => {
          const phaseMatches = matchesByPhase.get(phase)!
          const accent = phaseAccent(phase)
          const isFinal = phase === 'FINALS'

          return (
            <div key={phase} className="shrink-0 w-48">
              <div className={cn('font-display text-lg font-bold mb-3', accent.text)}>{fmtPhase(phase)}</div>
              <div className="flex flex-col">
                {phaseMatches.map(m => (
                  <BracketCard key={m.id} match={m} edge={accent.edge} isFinal={isFinal} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {phases.some(p => LOWER_PHASES.has(p) || UPPER_PHASES.has(p)) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-xs text-chalk-faint">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded-full bg-chalk-faint inline-block" />
            Upper bracket
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded-full bg-lower inline-block" />
            Lower bracket
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-[3px] rounded-full bg-gold inline-block" />
            Final
          </span>
        </div>
      )}
    </div>
  )
}
