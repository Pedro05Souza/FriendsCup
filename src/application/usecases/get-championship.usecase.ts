import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ChampionshipRepository,
  championshipRepositoryToken,
} from 'src/domain/interfaces/championship.interface';
import { ChampionshipDtoAssembler } from './assemblers/championship-dto.assembler';
import { ChampionshipDto } from '../dtos/championship.dto';

@Injectable()
export class GetChampionshipUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
    private readonly _championshipDtoAssembler: ChampionshipDtoAssembler,
  ) {}

  async getChampionshipById(championshipId: string): Promise<ChampionshipDto> {
    const championship =
      await this._championshipRepository.findChampionshipById(championshipId);

    if (championship === null) {
      throw new BadRequestException(
        `Championship with id ${championshipId} not found`,
      );
    }

    return this._championshipDtoAssembler.toDto(championship);
  }
}
