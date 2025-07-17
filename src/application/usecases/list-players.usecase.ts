import { Inject, Injectable } from '@nestjs/common';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';
import { PAGE_SIZE } from 'src/domain/constants';
import { PlayerDtoAssembler } from './assemblers/player-dto.assembler';
import { ListPlayersDto } from '../dtos/list-players.dto';

@Injectable()
export class ListPlayersUsecase {
  constructor(
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
    private readonly _playerDtoAssembler: PlayerDtoAssembler,
  ) {}

  async listPlayers(page: number): Promise<ListPlayersDto> {
    const listPlayerResponse = await this._playerRepository.listPlayers(
      page,
      PAGE_SIZE,
    );

    return {
      players: listPlayerResponse.players.map((player) =>
        this._playerDtoAssembler.toDto(player),
      ),
      hasMore: listPlayerResponse.hasMore,
    };
  }
}
