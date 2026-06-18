import type {
  NewPlayerEntity,
  PlayerEntity,
} from 'src/domain/entities/player.entity';

export interface ListPlayerResponse {
  players: PlayerEntity[];
  hasMore: boolean;
}

export interface PlayerRankingData {
  playerId: string;
  playerName: string;
  overallRating: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  titlesWon: number;
  titlesByChampionship: Record<string, number>;
}

export interface PlayerRepository {
  create(newPlayer: NewPlayerEntity): Promise<PlayerEntity>;
  update(player: PlayerEntity): Promise<void>;
  findById(id: string): Promise<PlayerEntity | null>;
  deleteById(id: string): Promise<void>;
  listPlayers(
    page: number,
    limit: number,
    name?: string,
  ): Promise<ListPlayerResponse>;
  findAll(): Promise<PlayerEntity[]>;
  getPlayerRankings(): Promise<PlayerRankingData[]>;
}

export const playerRepositoryToken = Symbol('PlayerRepository');
