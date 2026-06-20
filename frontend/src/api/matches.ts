import { apiFetch } from './client'
import type { H2HMatchDetail, MatchHistoryDto, Rivalry } from '../types'

export const matchesApi = {
  h2h: (playerId: string, opponentId: string) =>
    apiFetch<MatchHistoryDto>('GET', `/matches/history/${playerId}/${opponentId}`),

  h2hDetails: (playerId: string, opponentId: string) =>
    apiFetch<H2HMatchDetail[]>('GET', `/matches/history/${playerId}/${opponentId}/details`),

  rivalries: () =>
    apiFetch<Rivalry[]>('GET', '/matches/rivalries'),
}
