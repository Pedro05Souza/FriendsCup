import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { H2HMatchDetailDto } from '../dtos/h2h-match-detail.dto';

@Injectable()
export class GetH2HMatchDetailUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getDetail(p1Id: string, p2Id: string): Promise<H2HMatchDetailDto> {
    return this._championshipRepository.getMatchHistoryDetailForPlayers(
      p1Id,
      p2Id,
    );
  }
}
