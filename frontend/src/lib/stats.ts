import type { Championship, Match } from '../types'
import { fmtPhase } from './utils'

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

/** How deep a phase goes, for "furthest stage reached". */
const PHASE_DEPTH: Record<string, number> = {
  GROUP_STAGE: 0,
  'PLAY-INS': 1,
  ROUND_1_LOWER: 2,
  ROUND_OF_16: 2,
  ROUND_2_LOWER: 3,
  QUARTER_FINALS: 3,
  UPPER_BRACKET_QUARTER_FINALS: 3,
  ROUND_3_LOWER: 3,
  SEMIFINALS: 4,
  UPPER_BRACKET_SEMIFINALS: 4,
  LOWER_BRACKET_FINALS: 4,
  UPPER_BRACKET_FINALS: 5,
  THIRD_PLACE: 5,
  FINALS: 6,
}

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

export interface CupRun {
  championship: Championship
  matches: Match[]
  goals: number
  finish: string
  /** 0 = champion, higher = went out earlier */
  finishRank: number
  playedFinal: boolean
  wonFinal: boolean
  goldenBoot: boolean
}

/** A player's run through one championship, or null if they didn't take part. */
export function cupRun(c: Championship, playerId: string): CupRun | null {
  const matches = c.matches.filter(m => m.participants.some(p => p.id === playerId))
  const entered = matches.length > 0 || c.players.some(p => p.id === playerId)
  if (!entered) return null

  const goals = matches.reduce(
    (s, m) => s + (m.participants.find(p => p.id === playerId)?.goals ?? 0),
    0,
  )
  const final = matches.find(m => m.matchPhase === 'FINALS')
  const third = matches.find(m => m.matchPhase === 'THIRD_PLACE')
  const champion = c.championshipWinner?.id === playerId || final?.winnerId === playerId

  let finish: string
  let finishRank: number
  if (champion) {
    finish = 'Champion'
    finishRank = 0
  } else if (final) {
    finish = c.championshipWinner || final.winnerId ? 'Runner-up' : 'In the final'
    finishRank = 1
  } else if (third && third.winnerId) {
    finish = third.winnerId === playerId ? 'Third' : 'Fourth'
    finishRank = third.winnerId === playerId ? 2 : 3
  } else if (matches.length) {
    const deepest = matches.reduce(
      (best, m) => ((PHASE_DEPTH[m.matchPhase] ?? 0) > (PHASE_DEPTH[best] ?? 0) ? m.matchPhase : best),
      matches[0].matchPhase,
    )
    finish = fmtPhase(deepest)
    finishRank = 10 - (PHASE_DEPTH[deepest] ?? 0)
  } else {
    finish = 'No matches yet'
    finishRank = 20
  }

  return {
    championship: c,
    matches,
    goals,
    finish,
    finishRank,
    playedFinal: !!final,
    wonFinal: !!final && final.winnerId === playerId,
    goldenBoot: c.goldenBootWinner?.id === playerId,
  }
}

/** Points from a run of results: win 3, draw 1. */
export function formPoints(results: { result: string; decidedByPenalties: boolean }[]) {
  return results.reduce((s, e) => s + (e.decidedByPenalties ? 1 : e.result === 'W' ? 3 : e.result === 'D' ? 1 : 0), 0)
}
