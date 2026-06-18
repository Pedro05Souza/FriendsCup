import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
  return PHASE_LABELS[phase] ?? phase
}

export function medal(index: number) {
  return ['🥇', '🥈', '🥉'][index] ?? `${index + 1}.`
}

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
}

export function fmtDuo(name1: string, id1: string, name2: string, id2: string): string {
  return id1 === id2 ? name1 : `${name1} & ${name2}`
}
