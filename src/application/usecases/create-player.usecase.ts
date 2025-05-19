import { Inject, Injectable } from '@nestjs/common';
import { CreatePlayerDto } from 'src/application/dtos/create-player.dto';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { PlayerDtoAssembler } from './assemblers/player-dto.assembler';
import { PlayerDto } from 'src/application/dtos/player.dto';

@Injectable()
export class CreatePlayerUsecase {
  constructor(
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
    private readonly _playerDtoAssembler: PlayerDtoAssembler,
  ) {}

  async createPlayer(playerDto: CreatePlayerDto): Promise<PlayerDto> {
    const newPlayer = await this._playerRepository.create({
      name: playerDto.name,
      goalPerGame: 0,
    });

    return this._playerDtoAssembler.toDto(newPlayer);
  }
}
