import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { ChampionshipWinnersResponseDto } from '../dtos/championship-winners.dto';

@Injectable()
export class GetChampionshipWinnersUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getChampionshipWinners(): Promise<ChampionshipWinnersResponseDto> {
    const winners = await this._championshipRepository.getChampionshipWinners();

    if (winners.length === 0) {
      throw new BadRequestException('No championship winners found');
    }

    return winners.map((winner) => ({
      playerId: winner.playerId,
      playerName: winner.playerName,
      championships: winner.championships.map((championship) => ({
        championshipName: championship.championshipName,
        timesWon: championship.timesWon,
      })),
    }));
  }
}
