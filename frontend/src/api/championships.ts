import { apiFetch } from './client'
import type {
  AllTimeRecords,
  Championship,
  ChampionshipBrief,
  ChampionshipWinnerEntry,
  RecapData,
} from '../types'

export interface CreateChampionshipData {
  title: string
  createdAtIso: string
}

export interface CreateDuoData {
  player1Id: string
  player2Id: string
  name?: string
}

export interface MatchParticipantInput {
  id: string
  goals: number
  penaltyShootoutGoals?: number
}

export interface CreateMatchData {
  matchPhase: string
  participants: [MatchParticipantInput, MatchParticipantInput]
  groupId?: string
}

export const championshipsApi = {
  list: () =>
    apiFetch<ChampionshipBrief[]>('GET', '/championships'),

  get: (id: string) =>
    apiFetch<Championship>('GET', `/championships/${id}`),

  create: (data: CreateChampionshipData) =>
    apiFetch<void>('POST', '/championships', data),

  createDuo: (champId: string, data: CreateDuoData) =>
    apiFetch<void>('POST', `/championships/${champId}/duos`, data),

  createMatch: (champId: string, data: CreateMatchData) =>
    apiFetch<void>('POST', `/championships/${champId}/matches`, data),

  winners: () =>
    apiFetch<ChampionshipWinnerEntry[]>('GET', '/championships/winners'),

  recap: (year: string) =>
    apiFetch<RecapData>('GET', `/championships/recap/${year}`),

  records: () =>
    apiFetch<AllTimeRecords>('GET', '/championships/records'),
}
