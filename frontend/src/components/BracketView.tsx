import type { Match } from '../types'
import { cn, fmtPhase } from '../lib/utils'

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
  if (phase === 'FINALS') return 'text-amber-400'
  if (phase === 'THIRD_PLACE') return 'text-zinc-400'
  if (LOWER_PHASES.has(phase)) return 'text-blue-400'
  return 'text-emerald-400'
}

// ── Single bracket card ──────────────────────────────────────────────────────

function BracketCard({ match }: { match: Match }) {
  const [p1, p2] = match.participants
  const p1Wins = !!match.winnerId && match.winnerId === p1?.id
  const p2Wins = !!match.winnerId && match.winnerId === p2?.id
  const hasPens =
    (p1?.penaltyShootoutGoals ?? 0) > 0 || (p2?.penaltyShootoutGoals ?? 0) > 0

  const row = (
    name: string | undefined,
    goals: number | undefined,
    penGoals: number | undefined,
    wins: boolean,
    isLast: boolean,
  ) => (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 gap-2',
        !isLast && 'border-b border-gh-border/60',
        wins ? 'bg-white/[0.06]' : 'bg-gh-bg',
      )}
    >
      <span
        className={cn(
          'text-xs font-semibold truncate flex-1',
          wins ? 'text-zinc-100' : 'text-zinc-500',
        )}
      >
        {name ?? 'TBD'}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {hasPens && (
          <span className="text-[10px] text-zinc-600">
            ({penGoals ?? 0})
          </span>
        )}
        <span
          className={cn(
            'text-sm font-bold tabular-nums w-4 text-right',
            wins ? 'text-zinc-100' : 'text-zinc-600',
          )}
        >
          {goals ?? 0}
        </span>
      </div>
    </div>
  )

  return (
    <div className="border border-gh-border rounded-lg overflow-hidden mb-2.5 w-44">
      {row(p1?.name, p1?.goals, p1?.penaltyShootoutGoals, p1Wins, false)}
      {row(p2?.name, p2?.goals, p2?.penaltyShootoutGoals, p2Wins, true)}
    </div>
  )
}

// ── Main bracket view ────────────────────────────────────────────────────────

interface BracketViewProps {
  matches: Match[]
}

export default function BracketView({ matches }: BracketViewProps) {
  const matchesByPhase = new Map<string, Match[]>()
  matches.forEach((m) => {
    const arr = matchesByPhase.get(m.matchPhase) ?? []
    arr.push(m)
    matchesByPhase.set(m.matchPhase, arr)
  })

  const phases = PHASE_ORDER.filter((p) => matchesByPhase.has(p))

  if (phases.length === 0) {
    return (
      <p className="text-sm text-zinc-600 text-center py-8">No matches yet</p>
    )
  }

  return (
    <div className="overflow-x-auto pb-2 scrollbar-thin">
      <div
        className="flex gap-3 items-start"
        style={{ minWidth: `${phases.length * 188}px` }}
      >
        {phases.map((phase) => {
          const phaseMatches = matchesByPhase.get(phase)!
          const isFinal = phase === 'FINALS' || phase === 'THIRD_PLACE'

          return (
            <div key={phase} className="shrink-0 w-44">
              {/* Column header */}
              <div
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.12em] mb-3 text-center',
                  phaseAccent(phase),
                )}
              >
                {fmtPhase(phase)}
              </div>

              {/* Match cards */}
              <div
                className={cn(
                  'flex flex-col',
                  isFinal && 'items-center',
                )}
              >
                {phaseMatches.map((m) => (
                  <BracketCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Track legend if double-elimination phases present */}
      {phases.some((p) => LOWER_PHASES.has(p) || UPPER_PHASES.has(p)) && (
        <div className="flex gap-4 mt-4 text-[10px] text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/60 inline-block" />
            Upper bracket
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500/60 inline-block" />
            Lower bracket
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/60 inline-block" />
            Grand final
          </span>
        </div>
      )}
    </div>
  )
}
