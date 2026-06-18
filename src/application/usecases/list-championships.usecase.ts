import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { ChampionshipBriefDto } from '../dtos/championship-brief.dto';

@Injectable()
export class ListChampionshipsUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async listChampionships(): Promise<ChampionshipBriefDto[]> {
    const championships =
      await this._championshipRepository.listChampionships();

    return championships.map((c) => ({
      id: c.id,
      title: c.title,
      createdAtIso: c.createdAt.toISO()!,
      isDuo: c.isDuo,
      matchCount: c.matchCount,
      winnerName: c.winnerName,
    }));
  }
}
