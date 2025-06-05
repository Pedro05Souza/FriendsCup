import { Inject, Injectable } from '@nestjs/common';
import { CreateChampionshipDto } from '../dtos/create-championship.dto';
import { championshipRepositoryToken, ChampionshipRepository } from 'src/domain/interfaces/championship.interface';
import { DateTime } from 'luxon';

@Injectable()
export class CreateChampionshipUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async createChampionship(createChampionshipDto: CreateChampionshipDto): Promise<void> {
    await this._championshipRepository.create({
        title: createChampionshipDto.title,
        createdAt: DateTime.fromISO(createChampionshipDto.createdAtIso),
    })
    
  }
}