import type { Match } from '../types'

/** Bracket order, earliest round first. */
export const PHASE_ORDER = [
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


export const phaseIndex = (phase: string) => {
  const i = PHASE_ORDER.indexOf(phase)
  return i === -1 ? -1 : i
}

/** Matches sorted latest-round first (matches carry no timestamp, so round order is the best proxy). */
export function latestFirst(matches: Match[]) {
  return matches
    .map((m, i) => ({ m, i }))
    .sort((a, b) => phaseIndex(b.m.matchPhase) - phaseIndex(a.m.matchPhase) || b.i - a.i)
    .map(x => x.m)
}


/** Points from a run of results: win 3, draw 1. */
export function formPoints(results: { result: string; decidedByPenalties: boolean }[]) {
  return results.reduce((s, e) => s + (e.decidedByPenalties ? 1 : e.result === 'W' ? 3 : e.result === 'D' ? 1 : 0), 0)
}
