import { apiFetch } from './client'
import type { MatchHistoryDto, Rivalry } from '../types'

export const matchesApi = {
  h2h: (playerId: string, opponentId: string) =>
    apiFetch<MatchHistoryDto>('GET', `/matches/history/${playerId}/${opponentId}`),

  rivalries: () =>
    apiFetch<Rivalry[]>('GET', '/matches/rivalries'),
}
