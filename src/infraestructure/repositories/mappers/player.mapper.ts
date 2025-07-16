import type { Player } from '@prisma/client';
import { PlayerEntity } from 'src/domain/entities/player.entity';

export function playerModelToEntity(dbPlayer: Player): PlayerEntity {
  return new PlayerEntity({
    id: dbPlayer.id,
    name: dbPlayer.name,
    intelligence: dbPlayer.intelligence,
    defense: dbPlayer.defense,
    attack: dbPlayer.attack,
    mentality: dbPlayer.mentality,
  });
}
