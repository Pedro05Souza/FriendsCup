import type { Player } from '@prisma/client';
import type { PlayerEntity } from 'src/domain/entities/player.entity';

export function playerModelToEntity(dbPlayer: Player): PlayerEntity {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    intelligence: dbPlayer.intelligence,
    defense: dbPlayer.defense,
    attack: dbPlayer.attack,
    mentality: dbPlayer.mentality,
    goalsScored: dbPlayer.goalsScored,
    goalsConceded: dbPlayer.goalsConceded,
  };
}
