import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePlayerDto } from '../../application/dtos/create-player.dto';
import { UpdatePlayerDto } from 'src/application/dtos/update-player.dto';
import { PlayerRankingDto } from 'src/application/dtos/player-ranking.dto';
import { CreatePlayerUsecase } from 'src/application/usecases/create-player.usecase';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { DeletePlayerUsecase } from 'src/application/usecases/delete-player.usecase';
import { UpdatePlayerUsecase } from 'src/application/usecases/update-player.usecase';
import { ListPlayersUsecase } from 'src/application/usecases/list-players.usecase';
import { ListPlayersDto } from 'src/application/dtos/list-players.dto';
import { GetPlayerRankingsUsecase } from 'src/application/usecases/get-player-rankings.usecase';
import {
  RetrospectData,
  RetrospectUsecase,
} from 'src/application/usecases/retrospect.usecase';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly _createPlayerUsecase: CreatePlayerUsecase,
    private readonly _deletePlayerUsecase: DeletePlayerUsecase,
    private readonly _updatePlayerUsecase: UpdatePlayerUsecase,
    private readonly _listPlayersUsecase: ListPlayersUsecase,
    private readonly _retrospectUsecase: RetrospectUsecase,
    private readonly _getPlayerRankingsUsecase: GetPlayerRankingsUsecase,
  ) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto): Promise<PlayerDto> {
    return this._createPlayerUsecase.createPlayer(createPlayerDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return this._deletePlayerUsecase.deletePlayer(id);
  }

  @Post('/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ): Promise<PlayerDto> {
    return this._updatePlayerUsecase.updatePlayer(id, updatePlayerDto);
  }

  @Get('/rankings')
  async getRankings(): Promise<PlayerRankingDto[]> {
    return this._getPlayerRankingsUsecase.getPlayerRankings();
  }

  @Get()
  async list(
    @Query('page') page: number,
    @Query('name') name?: string,
  ): Promise<ListPlayersDto> {
    return this._listPlayersUsecase.listPlayers(page, name);
  }

  @Get('/:id/retrospect')
  async getRetrospect(@Param('id') id: string): Promise<RetrospectData> {
    return this._retrospectUsecase.getRetrospectForPlayer(id);
  }
}
