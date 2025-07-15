import type { DateTime } from 'luxon';
import type { RawChampionshipEntity } from '../entities/championship.entity';

export interface CreateChampionshipParams {
  title: string;
  createdAt: DateTime;
  isDuo: boolean;
}

export interface CreateDuoParams {
  player1Id: string;
  player2Id: string;
  championshipId: string;
}

export interface ChampionshipRepository {
  create(params: CreateChampionshipParams): Promise<void>;
  createDuo(params: CreateDuoParams): Promise<void>;
  findById(id: string): Promise<RawChampionshipEntity | null>;
}

export const championshipRepositoryToken = Symbol('ChampionshipRepository');
