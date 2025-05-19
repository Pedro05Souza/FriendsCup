import { NewPlayerEntity, PlayerEntity } from 'src/domain/entities/player.entity';

export interface PlayerRepository {
  create(newPlayer: NewPlayerEntity): Promise<PlayerEntity>;
  update(player: PlayerEntity): Promise<void>;
  findById(id: string): Promise<PlayerEntity | null>;
  deleteById(id: string): Promise<void>;
}

export const playerRepositoryToken = Symbol('PlayerRepository');
