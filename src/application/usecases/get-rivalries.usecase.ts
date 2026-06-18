import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { RivalryDto } from '../dtos/rivalry.dto';

const TOP_RIVALRIES_LIMIT = 10;

@Injectable()
export class GetRivalriesUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getTopRivalries(): Promise<RivalryDto[]> {
    return this._championshipRepository.getTopRivalries(TOP_RIVALRIES_LIMIT);
  }
}
