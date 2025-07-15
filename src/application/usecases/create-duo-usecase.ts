import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  championshipRepositoryToken,
  ChampionshipRepository,
} from 'src/domain/interfaces/championship.interface';
import { CreateDuoDto } from '../dtos/create-duo.dto';

@Injectable()
export class CreateDuoUsecase {
  constructor(
    @Inject(championshipRepositoryToken)
    private readonly _championshipRepository: ChampionshipRepository,
  ) {}

  async createDuo(
    championshipId: string,
    createDuoDto: CreateDuoDto,
  ): Promise<void> {
    const championship =
      await this._championshipRepository.findById(championshipId);

    if (championship === null) {
      throw new BadRequestException('Championship not found');
    }

    await this._championshipRepository.createDuo({
      player1Id: createDuoDto.player1Id,
      player2Id: createDuoDto.player2Id,
      championshipId: championship.id,
    });
  }
}
