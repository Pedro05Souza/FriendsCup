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
import { CreatePlayerUsecase } from 'src/application/usecases/create-player.usecase';
import { PlayerDto } from 'src/application/dtos/player.dto';
import { DeletePlayerUsecase } from 'src/application/usecases/delete-player.usecase';
import { UpdatePlayerUsecase } from 'src/application/usecases/update-player.usecase';
import { ListPlayersUsecase } from 'src/application/usecases/list-players.usecase';
import { ListPlayerResponse } from 'src/domain/interfaces/player.interface';
import { CreateDuoDto } from 'src/application/dtos/create-duo.dto';
import { CreateDuoUsecase } from 'src/application/usecases/create-duo-usecase';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly _createPlayerUsecase: CreatePlayerUsecase,
    private readonly _deletePlayerUsecase: DeletePlayerUsecase,
    private readonly _updatePlayerUsecase: UpdatePlayerUsecase,
    private readonly _listPlayersUsecase: ListPlayersUsecase,
    private readonly _createDuoUsecase: CreateDuoUsecase,
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

  @Get()
  async list(@Query('page') page: number): Promise<ListPlayerResponse> {
    return this._listPlayersUsecase.listPlayers(page);
  }

  @Post('/:championshipId/duos')
  async createDuo(
    @Param('championshipId') championshipId: string,
    @Body() createDuoDto: CreateDuoDto,
  ): Promise<void> {
    return this._createDuoUsecase.createDuo(championshipId, createDuoDto);
  }
}
