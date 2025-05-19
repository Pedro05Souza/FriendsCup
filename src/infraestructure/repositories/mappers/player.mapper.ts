import { Player } from '@prisma/client';
import { PlayerEntity } from 'src/domain/entities/player.entity';

export function playerModelToEntity(dbPlayer: Player): PlayerEntity {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    rating: dbPlayer.rating,
    goalPerGame: 1,
  };
}
