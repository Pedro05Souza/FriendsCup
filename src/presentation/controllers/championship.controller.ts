import { Body, Controller, Post } from '@nestjs/common';
import { CreateChampionshipDto } from 'src/application/dtos/create-championship.dto';
import { CreateChampionshipUsecase } from 'src/application/usecases/create-championship.usecase';

@Controller('/championships')
export class ChampionshipController {
  constructor(
    private readonly _createChampionshipUsecase: CreateChampionshipUsecase,
  ) {}

  @Post()
  async createChampionship(
    @Body() createChampionshipDto: CreateChampionshipDto,
  ): Promise<void> {
    await this._createChampionshipUsecase.createChampionship(
      createChampionshipDto,
    );
  }
}
