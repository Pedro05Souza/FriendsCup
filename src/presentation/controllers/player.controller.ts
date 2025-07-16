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
import { ListPlayersDto } from 'src/application/dtos/list-players.dto';

@Controller('players')
export class PlayerController {
  constructor(
    private readonly _createPlayerUsecase: CreatePlayerUsecase,
    private readonly _deletePlayerUsecase: DeletePlayerUsecase,
    private readonly _updatePlayerUsecase: UpdatePlayerUsecase,
    private readonly _listPlayersUsecase: ListPlayersUsecase,
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
  async list(@Query('page') page: number): Promise<ListPlayersDto> {
    return this._listPlayersUsecase.listPlayers(page);
  }
}
