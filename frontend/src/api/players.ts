import { apiFetch } from './client'
import type { FormEntry, ListPlayersResponse, Player, PlayerFormData, PlayerRanking, RetrospectData } from '../types'

export const playersApi = {
  list: (page: number, name?: string) => {
    const params = new URLSearchParams({ page: String(page) })
    if (name) params.set('name', name)
    return apiFetch<ListPlayersResponse>('GET', `/players?${params}`)
  },

  all: async (): Promise<Player[]> => {
    let page = 1
    let all: Player[] = []
    while (true) {
      const res = await apiFetch<ListPlayersResponse>('GET', `/players?page=${page}`)
      all = [...all, ...res.players]
      if (!res.hasMore) break
      page++
    }
    return all
  },

  rankings: () =>
    apiFetch<PlayerRanking[]>('GET', '/players/rankings'),

  create: (data: PlayerFormData) =>
    apiFetch<Player>('POST', '/players', data),

  update: (id: string, data: PlayerFormData) =>
    apiFetch<Player>('POST', `/players/${id}`, data),

  remove: (id: string) =>
    apiFetch<void>('DELETE', `/players/${id}`),

  form: (id: string) =>
    apiFetch<FormEntry[]>('GET', `/players/${id}/form`),

  retrospect: (id: string) =>
    apiFetch<RetrospectData>('GET', `/players/${id}/retrospect`),
}
