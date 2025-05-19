import { Injectable } from '@nestjs/common';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { PlayerEntity } from 'src/domain/entities/player.entity';

@Injectable()
export class PlayerDtoAssembler {
  toDto(playerEntity: PlayerEntity): PlayerDto {
    return {
      id: playerEntity.id,
      name: playerEntity.name,
      rating: playerEntity.rating,
    };
  }
}
