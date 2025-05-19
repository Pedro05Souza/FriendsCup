import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  PlayerRepository,
  playerRepositoryToken,
} from 'src/domain/interfaces/player.interface';

@Injectable()
export class DeletePlayerUsecase {
  constructor(
    @Inject(playerRepositoryToken)
    private readonly _playerRepository: PlayerRepository,
  ) {}

  async deletePlayer(id: string): Promise<void> {
    const player = await this._playerRepository.findById(id);

    if (player === null) {
      throw new BadRequestException('Player not found');
    }

    await this._playerRepository.deleteById(id);
  }
}
