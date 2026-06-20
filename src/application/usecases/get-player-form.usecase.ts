import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { PlayerFormDto } from '../dtos/player-form.dto';

const FORM_LIMIT = 5;

@Injectable()
export class GetPlayerFormUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getPlayerForm(playerId: string): Promise<PlayerFormDto> {
    return this._championshipRepository.getRecentMatchesForPlayer(
      playerId,
      FORM_LIMIT,
    );
  }
}
