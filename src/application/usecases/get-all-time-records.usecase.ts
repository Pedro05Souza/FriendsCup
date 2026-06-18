import { Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { AllTimeRecordsDto } from '../dtos/all-time-records.dto';

@Injectable()
export class GetAllTimeRecordsUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async getAllTimeRecords(): Promise<AllTimeRecordsDto> {
    return this._championshipRepository.getAllTimeRecords();
  }
}
