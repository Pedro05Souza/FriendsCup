import type {
  NewPlayerEntity,
  PlayerEntity,
} from 'src/domain/entities/player.entity';

export interface ListPlayerResponse {
  players: PlayerEntity[];
  hasMore: boolean;
}
export interface PlayerRepository {
  create(newPlayer: NewPlayerEntity): Promise<PlayerEntity>;
  update(player: PlayerEntity): Promise<void>;
  findById(id: string): Promise<PlayerEntity | null>;
  deleteById(id: string): Promise<void>;
  listPlayers(page: number, limit: number): Promise<ListPlayerResponse>;
}

export const playerRepositoryToken = Symbol('PlayerRepository');
