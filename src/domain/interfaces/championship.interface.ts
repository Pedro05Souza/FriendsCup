import type { DateTime } from 'luxon';
import type { ChampionshipEntity } from '../entities/championship.entity';
import type { MatchPhase } from '../constants';
import type {
  DuoEntity,
  GroupDuoEntity,
  GroupPlayerEntity,
  PlayerEntity,
} from '../entities/player.entity';
import type { GroupEntity } from '../entities/group.entity';
import type { MatchEntity } from '../entities/match.entity';

export interface CreateChampionshipParams {
  title: string;
  createdAt: DateTime;
  isDuo: boolean;
}

export interface CreateDuoParams {
  player1Id: string;
  player2Id: string;
  championshipId: string;
  name: string;
}

export interface CreateGroupEntityParams {
  playerId?: string;
  duoId?: string;
  points: number;
  goalDifference: number;
  championshipGroupId: string;
}

export interface CreateMatchParticipant {
  matchId: string;
  playerId?: string;
  duoId?: string;
  goals: number;
  penaltyShootoutGoals?: number;
}

export interface CreateChampionshipParticipantParams {
  championshipId: string;
  playerIds?: string[];
  duoIds?: string[];
}

export interface ChampionshipWinnersInfo {
  championshipName: string;
  timesWon: number;
}

export interface ChampionshipWinners {
  playerId: string;
  playerName: string;
  championships: ChampionshipWinnersInfo[];
}

export interface ChampionshipRepository {
  createChampionship(params: CreateChampionshipParams): Promise<void>;
  createDuo(params: CreateDuoParams): Promise<DuoEntity>;
  findChampionshipById(id: string): Promise<ChampionshipEntity | null>;
  bulkCreateParticipantsForChampionship(
    params: CreateChampionshipParticipantParams,
  ): Promise<void>;
  createMatch(
    championshipId: string,
    matchPhase: MatchPhase,
    winnerId?: string,
    duoWinnerId?: string,
  ): Promise<MatchEntity>;
  createMatchParticipant(
    matchParticipant: CreateMatchParticipant,
  ): Promise<void>;
  getDuoPlayersById(duoId: string): Promise<DuoEntity | null>;
  createChampionshipGroup(championshipId: string): Promise<GroupEntity>;
  getGroupById(groupId: string): Promise<GroupEntity | null>;
  getGroupByParticipantId(
    participantId: string,
    championshipId?: string,
  ): Promise<GroupEntity | null>;
  createGroupParticipant(
    params: CreateGroupEntityParams,
  ): Promise<GroupPlayerEntity | GroupDuoEntity>;
  updateGroupParticipant(
    groupParticipant: GroupPlayerEntity | GroupDuoEntity,
  ): Promise<void>;
  getMatchesByIds(matchIds: string[]): Promise<MatchEntity[]>;
  findParticipantsByChampionshipId(
    championshipId: string,
  ): Promise<Array<DuoEntity | PlayerEntity>>;
  updateChampionshipWinner(
    championshipId: string,
    winnerId?: string,
    duoWinnerId?: string,
  ): Promise<void>;
  getGroupsByIds(groupIds: string[]): Promise<GroupEntity[]>;
  getMatchHistoryForPlayers(
    playerId: string,
    opponentId: string,
  ): Promise<MatchEntity[]>;
  getChampionshipWinners(): Promise<ChampionshipWinners[]>;
}

export const championshipRepositoryToken = Symbol('ChampionshipRepository');
