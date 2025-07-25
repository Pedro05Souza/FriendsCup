import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { PlayerDtoAssembler } from './assemblers/player-dto.assembler';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { UpdatePlayerDto } from '../dtos/update-player.dto';

@Injectable()
export class UpdatePlayerUsecase {
  constructor(
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
    private readonly _playerDtoAssembler: PlayerDtoAssembler,
  ) {}

  async updatePlayer(
    id: string,
    playerDto: UpdatePlayerDto,
  ): Promise<PlayerDto> {
    const existingPlayer = await this._playerRepository.findById(id);

    if (existingPlayer === null) {
      throw new BadRequestException(`Player with id ${id} does not exist.`);
    }

    existingPlayer.attack = playerDto.attack;
    existingPlayer.defense = playerDto.defense;
    existingPlayer.intelligence = playerDto.intelligence;
    existingPlayer.mentality = playerDto.mentality;

    await this._playerRepository.update(existingPlayer);
    return this._playerDtoAssembler.toDto(existingPlayer);
  }
}
