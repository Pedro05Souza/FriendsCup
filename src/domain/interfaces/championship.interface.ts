import type { DateTime } from 'luxon';
import type {
  ChampionshipBriefEntity,
  ChampionshipEntity,
  CompleteChampionshipEntity,
} from '../entities/championship.entity';
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
  getAllChampionshipsByYear(
    year: string,
  ): Promise<CompleteChampionshipEntity[]>;
  getAllMatchesWonByPlayerId(playerId: string): Promise<MatchEntity[]>;
  getAllMatchesLostByPlayerId(playerId: string): Promise<MatchEntity[]>;
  getAllMatchesDrawnByPlayerId(playerId: string): Promise<MatchEntity[]>;
  listChampionships(): Promise<ChampionshipBriefEntity[]>;
  getAllTimeRecords(): Promise<AllTimeRecordsData>;
  getTopRivalries(limit: number): Promise<RivalryData[]>;
  getRecentMatchesForPlayer(playerId: string, limit: number): Promise<PlayerFormData[]>;
  getMatchHistoryDetailForPlayers(p1Id: string, p2Id: string): Promise<H2HMatchDetailData[]>;
  getMatchById(matchId: string): Promise<StoredMatch | null>;
  updateMatch(params: UpdateMatchParams): Promise<void>;
  deleteMatch(matchId: string): Promise<void>;
  setChampionshipWinner(
    championshipId: string,
    winnerId: string | null,
    isDuo: boolean,
  ): Promise<void>;
  getPlayerSummaryData(playerId: string): Promise<PlayerSummaryChampionshipData[]>;
}

/** A match together with the championship it belongs to. */
export interface StoredMatch extends MatchEntity {
  championshipId: string;
}

export interface UpdateMatchParams {
  matchId: string;
  matchPhase: MatchPhase;
  isDuo: boolean;
  /** Player id (1v1) or duo id (2v2) of the winner; null for a draw. */
  winnerId: string | null;
  participants: Array<{
    participantId: string;
    goals: number;
    penaltyShootoutGoals?: number;
  }>;
}

export interface PlayerSummaryParticipantData {
  /** Player id in 1v1 matches, duo id in 2v2 matches. */
  id: string;
  name: string;
  goals: number;
  penaltyShootoutGoals: number;
  isDuo: boolean;
  /** The players behind this side: one for a player, two for a duo. */
  memberIds: string[];
}

export interface PlayerSummaryMatchData {
  id: string;
  matchPhase: MatchPhase;
  winnerId: string | null;
  participants: PlayerSummaryParticipantData[];
}

export interface PlayerSummaryChampionshipData {
  id: string;
  title: string;
  createdAt: DateTime;
  isDuo: boolean;
  /** Player id or duo id of the champion. */
  winnerId: string | null;
  matches: PlayerSummaryMatchData[];
}

export interface PlayerFormData {
  result: 'W' | 'D' | 'L';
  goalsFor: number;
  goalsAgainst: number;
  opponentName: string;
  championship: string;
  phase: string;
  decidedByPenalties: boolean;
}

export interface H2HMatchDetailData {
  championship: string;
  year: number;
  phase: string;
  goalsP1: number;
  goalsP2: number;
  result: 'W' | 'D' | 'L';
}

export interface AllTimeRecordsData {
  topScorer: {
    playerId: string;
    playerName: string;
    value: number;
  } | null;
  mostMatchesPlayed: {
    playerId: string;
    playerName: string;
    value: number;
  } | null;
  mostTitles: {
    playerId: string;
    playerName: string;
    value: number;
  } | null;
  highestWinRate: {
    playerId: string;
    playerName: string;
    winRate: number;
    matchesPlayed: number;
  } | null;
  biggestWin: {
    playerName: string;
    opponentName: string;
    value: number;
    scoreline: string;
    championship: string;
    phase: string;
  } | null;
  mostGoalsInOneMatch: {
    playerName: string;
    value: number;
    championship: string;
    phase: string;
  } | null;
}

export interface RivalryData {
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  matchesPlayed: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  player1Goals: number;
  player2Goals: number;
  classicScore: number;
}

export const championshipRepositoryToken = Symbol('ChampionshipRepository');
