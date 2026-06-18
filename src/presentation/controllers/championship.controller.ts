import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AllTimeRecordsDto } from 'src/application/dtos/all-time-records.dto';
import { ChampionshipBriefDto } from 'src/application/dtos/championship-brief.dto';
import { ChampionshipWinnersResponseDto } from 'src/application/dtos/championship-winners.dto';
import { ChampionshipDto } from 'src/application/dtos/championship.dto';
import { CreateChampionshipDto } from 'src/application/dtos/create-championship.dto';
import { CreateDuoDto } from 'src/application/dtos/create-duo.dto';
import { CreateMatchDto } from 'src/application/dtos/create-match.dto';
import { CreateChampionshipUsecase } from 'src/application/usecases/create-championship.usecase';
import { CreateDuoUsecase } from 'src/application/usecases/create-duo.usecase';
import { CreateMatchUsecase } from 'src/application/usecases/create-match.usecase';
import { GetChampionshipWinnersUsecase } from 'src/application/usecases/get-championship-winners.usecase';
import { GetChampionshipUsecase } from 'src/application/usecases/get-championship.usecase';
import { ListChampionshipsUsecase } from 'src/application/usecases/list-championships.usecase';
import { GetAllTimeRecordsUsecase } from 'src/application/usecases/get-all-time-records.usecase';
import {
  RecapData,
  RecapUsecase,
} from 'src/application/usecases/recap.usecase';

@Controller('/championships')
export class ChampionshipController {
  constructor(
    private readonly _createChampionshipUsecase: CreateChampionshipUsecase,
    private readonly _createDuoUsecase: CreateDuoUsecase,
    private readonly _createMatchUsecase: CreateMatchUsecase,
    private readonly _getChampionshipUsecase: GetChampionshipUsecase,
    private readonly _getChampionshipWinnersUsecase: GetChampionshipWinnersUsecase,
    private readonly _recapUsecase: RecapUsecase,
    private readonly _listChampionshipsUsecase: ListChampionshipsUsecase,
    private readonly _getAllTimeRecordsUsecase: GetAllTimeRecordsUsecase,
  ) {}

  @Get()
  async listChampionships(): Promise<ChampionshipBriefDto[]> {
    return this._listChampionshipsUsecase.listChampionships();
  }

  @Get('/records')
  async getAllTimeRecords(): Promise<AllTimeRecordsDto> {
    return this._getAllTimeRecordsUsecase.getAllTimeRecords();
  }

  @Get('/winners')
  async getChampionshipWinners(): Promise<ChampionshipWinnersResponseDto> {
    return this._getChampionshipWinnersUsecase.getChampionshipWinners();
  }

  @Get('/:championshipId')
  async getChampionshipById(
    @Param('championshipId') championshipId: string,
  ): Promise<ChampionshipDto> {
    return this._getChampionshipUsecase.getChampionshipById(championshipId);
  }

  @Post()
  async createChampionship(
    @Body() createChampionshipDto: CreateChampionshipDto,
  ): Promise<void> {
    await this._createChampionshipUsecase.createChampionship(
      createChampionshipDto,
    );
  }

  @Post('/:championshipId/duos')
  async createDuo(
    @Param('championshipId') championshipId: string,
    @Body() createDuoDto: CreateDuoDto,
  ): Promise<void> {
    return this._createDuoUsecase.createDuo(championshipId, createDuoDto);
  }

  @Post('/:championshipId/matches')
  async createMatch(
    @Param('championshipId') championshipId: string,
    @Body() createMatchDto: CreateMatchDto,
  ): Promise<void> {
    return this._createMatchUsecase.createMatch(championshipId, createMatchDto);
  }

  @Get('/recap/:year')
  async getRecap(@Param('year') year: string): Promise<RecapData> {
    return this._recapUsecase.getRecap(year);
  }
}
