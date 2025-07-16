import type { DateTime } from 'luxon';
import type { RawChampionshipEntity } from '../entities/championship.entity';
import type { MatchPhase } from '../constants';
import type {
  DuoEntity,
  GroupDuoEntity,
  GroupPlayerEntity,
} from '../entities/player.entity';
import type { GroupEntity } from '../entities/group.entity';

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

export interface CreateMatchParams {
  playerId?: string;
  duoId?: string;
  playerGoals: number;
  matchPhase: MatchPhase;
  isPenaltyShootout: boolean;
  penaltyShootoutScore?: number;
  championshipId: string;
}

export interface CreateGroupEntityParams {
  playerId?: string;
  duoId?: string;
  points: number;
  goalDifference: number;
  championshipGroupId: string;
}

export interface ChampionshipRepository {
  create(params: CreateChampionshipParams): Promise<void>;
  createDuo(params: CreateDuoParams): Promise<void>;
  findById(id: string): Promise<RawChampionshipEntity | null>;
  createMatch(params: CreateMatchParams): Promise<void>;
  getDuoPlayersById(duoId: string): Promise<DuoEntity | null>;
  createChampionshipGroup(championshipId: string): Promise<GroupEntity>;
  getGroupById(groupId: string): Promise<GroupEntity | null>;
  getGroupByPlayerId(playerId: string): Promise<GroupEntity | null>;
  getGroupByDuoId(duoId: string): Promise<GroupEntity | null>;
  createGroupParticipant(
    params: CreateGroupEntityParams,
  ): Promise<GroupPlayerEntity | GroupDuoEntity>;
  updateGroupParticipant(
    groupParticipant: GroupPlayerEntity | GroupDuoEntity,
  ): Promise<void>;
}

export const championshipRepositoryToken = Symbol('ChampionshipRepository');
