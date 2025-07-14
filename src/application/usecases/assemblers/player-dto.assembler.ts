import { Injectable } from '@nestjs/common';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { PlayerEntity } from 'src/domain/entities/player.entity';

@Injectable()
export class PlayerDtoAssembler {
  toDto(playerEntity: PlayerEntity): PlayerDto {
    return {
      id: playerEntity.id,
      name: playerEntity.name,
      intelligence: playerEntity.intelligence,
      defense: playerEntity.defense,
      attack: playerEntity.attack,
      mentality: playerEntity.mentality,
      goalsScored: playerEntity.goalsScored,
      goalsConceded: playerEntity.goalsConceded,
      overrallRating: Math.round(
        (playerEntity.intelligence +
          playerEntity.defense +
          playerEntity.attack +
          playerEntity.mentality) /
          4,
      ),
    };
  }
}
