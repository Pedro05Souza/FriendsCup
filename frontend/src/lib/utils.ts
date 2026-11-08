import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDate(iso: string) {
  try {
    // Cup dates are stored as midnight UTC; read them in UTC so they don't shift a day
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
  } catch {
    return iso
  }
}

const PHASE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage',
  'PLAY-INS': 'Play-Ins',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter Finals',
  UPPER_BRACKET_QUARTER_FINALS: 'UB Quarter Finals',
  UPPER_BRACKET_SEMIFINALS: 'UB Semifinals',
  UPPER_BRACKET_FINALS: 'UB Finals',
  ROUND_1_LOWER: 'Lower Bracket R1',
  ROUND_2_LOWER: 'Lower Bracket R2',
  ROUND_3_LOWER: 'Lower Bracket R3',
  LOWER_BRACKET_FINALS: 'LB Finals',
  SEMIFINALS: 'Semifinals',
  THIRD_PLACE: 'Third Place',
  FINALS: 'Finals',
}

export const ALL_PHASES = Object.keys(PHASE_LABELS)
export const TOURNAMENT_NAMES = [
  'COPA NABOR',
  'COPA CHILELA',
  'COPA DOUGLAS',
  'COPA DEIVES',
  'COPA POLAR',
] as const

export function fmtPhase(phase: string) {
  // Round of 32 only comes up in the simulator, so it isn't offered when adding matches
  return PHASE_LABELS[phase] ?? (phase === 'ROUND_OF_32' ? 'Round of 32' : phase)
}

export function medal(index: number) {
  return ['🥇', '🥈', '🥉'][index] ?? `${index + 1}.`
}

/** "COPA NABOR" → "Nabor" */
export function fmtCup(name: string) {
  const short = name.replace(/^COPA\s+/i, '')
  return short.charAt(0).toUpperCase() + short.slice(1).toLowerCase()
}

/** "COPA NABOR" → "Copa Nabor" */
export function fmtCupFull(name: string) {
  return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

const FINISH_LABELS: Record<string, string> = {
  CHAMPION: 'Champion',
  RUNNER_UP: 'Runner-up',
  FINALIST: 'Finalist',
  THIRD: 'Third',
  FOURTH: 'Fourth',
  NOT_STARTED: 'No matches yet',
}

/** "Champion", "Runner-up", or the round they went out in. */
export function fmtFinish(finish: string, phase?: string | null) {
  if (finish === 'ELIMINATED') return phase ? fmtPhase(phase) : 'Knocked out'
  return FINISH_LABELS[finish] ?? finish
}

/** Text colour for an overall rating tier. */
export function ratingTone(value: number) {
  if (value >= 75) return 'text-win'
  if (value >= 50) return 'text-gold'
  return 'text-loss'
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function fmtDuo(name1: string, id1: string, name2: string, id2: string): string {
  return id1 === id2 ? name1 : `${name1} & ${name2}`
}

/** 0.4127 → "41%"; tiny but non-zero chances read "<1%" rather than "0%". */
export function pct(p: number) {
  if (p > 0 && p < 0.005) return '<1%'
  return `${Math.round(p * 100)}%`
}
