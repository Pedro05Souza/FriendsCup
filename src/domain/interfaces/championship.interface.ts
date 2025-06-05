import { DateTime } from 'luxon'

export interface CreateChampionshipParams {
    title: string;
    createdAt: DateTime;
}

export interface ChampionshipRepository {
    create(params: CreateChampionshipParams): Promise<void>;
}

export const championshipRepositoryToken = Symbol('ChampionshipRepository');